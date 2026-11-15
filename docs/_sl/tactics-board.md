---
title: "Taktična tabla"
nav_order: 15
has_children: true
lang: "sl"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Taktična tabla

Zavihek **Taktika** je risalna tabla za načrt ekipe: na zemljevid postavite majhne figure, narišete puščice, kam gredo, in pritisnete predvajanje, da vidite, kako se stvar odvije. Uporabite ga za načrtovanje runde ali napada pred igro. Platno, kamero in [raven](levels.md) deli z drugimi zavihki, nič drugega; načrt ni podatek in ne riše toplote.

## Vaš prvi načrt {#your-first-plan}

1. Odprite zavihek **Taktika**. Izberite **Igra** (na primer Counter-Strike 2) in za Valorant pritisnite **Naloži zemljevide Valoranta** ter izberite **Zemljevid**. Lahko pa prej naložite [raven](levels.md).
2. Izberite **Stran** (določi barvo) in pritisnite **Pogled od zgoraj**.
3. Izberite **Mesto**, izberite figuro pod **Figure** (z **Išči figure** jo poiščite) in kliknite na zemljevid. Postavite dve ali tri.
4. Izberite **Puščica**, kliknite na figuro, kliknite vzdolž poti, po kateri naj gre, in pritisnite **Enter**, da končate puščico.
5. Pod pogledom pritisnite **+**, da dodate korak 2. Vsaka figura se začne tam, kjer se je končala njena puščica. Tam narišite več puščic.
6. Pritisnite **▶** (ali `K`), da predvajate načrt od prikazanega koraka do konca.
7. Imenujte načrt v **Ime načrta** in pritisnite **Shrani**.

![Zavihek Taktika v pogledu od zgoraj: igra, strani in orodja levo, tri figure s puščicami Premik, lok metanja dima, območje in koraki ob dnu](../assets/img/en/tactics.webp)

## Začetek načrta {#starting-a-plan}

| Kontrola | Kaj naredi |
|---|---|
| **Igra** | Izbere strani in figure, ki jih ponuja paleta: Counter-Strike 2 (T, CT; igralci in pripomočki), Valorant (Napad, Obramba; igralci in splošne sposobnosti), Battlefield, Squad, Arma (pehota, kopenska vozila, letala, čolni), DCS / War Thunder / IL-2 (reaktivna letala, propelerska letala, helikopterji, protiletalska obramba, kopno, ladje, orožje) in Drugo. Načrt, ki že ima figure, ob spremembi igre ohrani svoje strani. |
| **Ime načrta** | Ime, pod katerim se načrt shrani. |
| **Zemljevid**, **Naloži zemljevide Valoranta** | Z izbranim Valorantom: **Naloži zemljevide Valoranta** pridobi seznam zemljevidov z [valorant-api.com](https://valorant-api.com); **Zemljevid** nato položi minimap izbranega zemljevida kot raven, uokvirjeno od zgoraj. Slika se pridobi ob izbiri in nikoli ni priložena. Obvestilo Riot se prikaže, dokler je na zaslonu (glejte spodaj). |
| **Stran** | Stran, ki pripada naslednji figuri, puščici ali območju; prevzame barvo strani. |

Brez ravni je tabla ravna tla. Ravnino naložite pod **Raven**, da načrtujete na pravem zemljevidu: zemljevid CS2, izvožen z orodjem CS2, raven iz knjižnice ali slika zemljevida.

## Orodja {#tools}

| Orodje | Klik | Opombe |
|---|---|---|
| **Izberi** | Figura, točka poti, puščica, območje ali opomba se izberejo. | Shift+klik doda ali odstrani; Shift+povlek nariše okvir okoli tega, kar dodate. Izbira dobi gizmo za preoblikovanje (glejte spodaj); `Delete` ali `Backspace` jo odstrani. `M` premakne izbrano figuro na naslednji klik. |
| **Mesto** | Položi izbrano figuro. | Figura se izbere v paleti **Figure** (z **Išči figure**). Če nič ni izbrano, `R` obrne naslednjo figuro za 15° preden se postavi (`Shift+R` v drugo smer). |
| **Puščica** | Vsak klik doda točko; Enter, dvojni klik ali desni klik konča, Esc jo opusti. | **Premik**, **Napad** (širša glava) ali **Opazovanje** (tanka črta na višini oči). Puščica, začeta na figuri, je pot te figure v tem koraku: ob predvajanju jo figura prehodi, naslednji korak pa se začne tam, kjer se je končala. |
| **Met** | Metalec, nato kam pristane. | Črtkan lok od enega do drugega, izbrani pripomoček (dim, bliskavica, molotov ...) se pojavi tam, kjer pristane, in ostane od tega koraka naprej. |
| **Območje** | Središče, nato rob. | Krog v barvi strani. |
| **Opomba** | Kam gre opomba; vpraša za besedilo. | Prikazana kot pribodalo, njeno besedilo je nad njim. |
| **Izbriši** | Figura, puščica, območje ali opomba. | Odstrani jo od tega koraka naprej; na njenem prvem koraku jo odstrani povsem. |

**Razveljavi** in **Ponovi** (`Ctrl+Z`; `Ctrl+Y` ali `Ctrl+Shift+Z`) se premikata po vsaki spremembi. Črta pod načrtom pove, koliko figur, puščic in korakov ima. **Pogled od zgoraj** gleda naravnost navzdol (ortografsko), **Pogled 3D** se vrne na perspektivo, **Uokvir** prilagodi načrt, ali raven, kadar je načrt prazen.

**Velikost figur** skalira vsako figuro na tabli; 1× je prava velikost, kar je od zgoraj le nekaj pikslov za človeka.

## Premikanje, obračanje in skaliranje {#moving-turning-and-scaling}

Vse na tabli se lahko premika kot v 3D urejevalniku: figure, pripomočki, oznake, posamezne točke poti in cele puščice, območja in opombe. Izbrano dobi gizmo na sredini:

| Način | Tipke | Ročaji |
|---|---|---|
| **Premik** | W (ali G) | Puščica za vsako os (X rdeča, Y zelena in navzgor, Z modra) se premakne vzdolž nje; kvadrat se premakne po svoji ravnini; središče se premakne čez raven pod kazalcem. |
| **Vrtenje** | E (ali R) | Obroč za vsako os se zavrti okoli nje. Obroči ene figure so njen lastni zasuk, nagib in naklon; skupina se zavrti okoli svetovnih osi okoli svoje sredine. |
| **Skaliranje** | R (ali S) | Razširi ali zbere izbiro iz sredine vzdolž osi ali na vse strani; polmer območja raste z njim. |

**Tipke** preklopijo med W / E / R (Unity, Unreal) in G / R / S (Blender); tipke izberejo način samo, ko je nekaj izbrano, sicer leti kamera. Tako `R` pomeni **Skaliranje** s tipkami W / E / R in **Vrtenje** s tipkami G / R / S, ko je nekaj izbrano, in obrne naslednjo figuro za postavitev, ko nič ni. Vse tipke table so navedene v [pregledu tipkovnice](keyboard-reference.md#tactics-board). Med vlečenjem držite **Ctrl**, da premik pripnete na **Mrežo** (metri) ali obrat na **Korak kota**. **Pripni na tla** (privzeto vklopljeno) postavi premaknjene ljudi, vozila, oznake, točke poti in območja na površino ravni; letala in helikopterji ohranijo svojo višino, vlečenje po puščici Y pa se nikoli ne pripne. Vlečenje ročaja nikoli ne premakne kamere. **Esc** prekliče vlečenje, vsaka sprememba pa je en korak Razveljavi.

Točke poti so prikazane kot pike na puščicah prikazanega koraka: kliknite jo, da jo izberete, povlecite, da jo premaknete, Delete, da jo odstranite. Razdelek **Izbrano** kaže mesto izbire v metrih, zasuk, nagib in naklon figure v stopinjah ter polmer območja, vsako za vpis.

## Časovna določitev {#timing}

Pot figure je časovno določena: vsak odsek traja svojo dolžino čez raven - vzorčeno na površini vsakih nekaj metrov, zato hrib ali stopnišče med dvema točkama šteje - s hitrostjo njenega **načina** gibanja za to figuro v tej igri, plus morebitni **počakaj** na točki poti. Pehota se plazi, počepne, hodi (tiho), teče ali sprinta; vozila in čolni se plazijo, gredo previdno, normalno ali hitro; letala in helikopterji letijo počasi, na križarski hitrosti, bojni hitrosti ali največji. Način, ki ga igra nima (CS2 nima sprinta), vzame najbližjega, ki ga ima. Kako strmina upočasni, je odvisno od igre: v CS2 in Valorantu šteje le vodoravna razdalja, kot v igrah; vojaški simulatorji upočasnijo pehoto v hrib (Toblerjeva funkcija hoje) in vozila po naklonu.

Hitrosti prihajajo iz tabel po igrah z viri (glejte [Hitrosti gibanja](tactics-speeds.md)): CS2 po orožju v rokah, iz definicij orožij igre; Valorant po orožju; Battlefield, Squad, Arma in letalske igre po tipu vozila in razredu. **Giblje se kot** izbere profil figure (orožje, tip vozila); **Lastna (m/s)** preglasi kateri koli način za to figuro. Načini so poimenovani, kot jih prikazuje tabla: *Plazenje*, *Počep*, *Hoja (tiho)*, *Tek*, *Sprint*; *Previdno*, *Normalno*, *Hitro*; *Počasi*, *Križarjenje*, *Boj*, *Največ*.

Vsaka točka poti kaže čas od zadnje in čas od začetka načrta (»+3,9 s · 0:12«). Pot izbrane figure našteje vsak odsek z njegovim načinom, dolžino in časom, čakanjem in prihodom. **Prihodi** pod **Časovno določitev** postavi vsako figuro z potjo na eno časovno os, prvi prihod na vrhu. S **Predvajaj v realnem času** (privzeto vklopljeno) korak traja, dokler ne pride najpočasnejša pot, vsaka figura pa se premika s svojo hitrostjo; **Sekunde** je tedaj najmanjša dolžina koraka. **Enote ravni na meter** pove, v čem je raven: 39,37 za zemljevide CS2 (enote igre), 1 za zemljevide v metrih.

## Primerjava s podatki tekem {#compare-with-match-data}

**Naloži datoteke tekem…** prebere tabele tekem CS2 zemljevida (datoteke Parquet orodja CS2, kolikor jih želite; samo potrebni stolpci, v ozadju); **Uporabi naložene podatke** vzame podatke, naložene v pregledovalnik. Nato:

- **Najzgodnejši prihod na zemljevid** obarva zemljevid s časom od začetka runde, ob katerem je igralec prvič prišel na vsako mesto - gumb **Najhitrejši** pokaže najhitrejše čez vse runde, **Tipični (mediana)** srednjo rundo - zeleno zgodaj, rdeče pozno, za eno ali obe strani. Pokaže, kaj je mogoče in kdaj.
- Izbrana pot se primerja s tem, kar so igralci dosegli od njenega začetka (ali od začetka runde) do njenega konca, vsak konec je krog nastavljenega polmera: »Najhitreje opaženo 14,2 s, p10 15,0 s, mediana 18,3 s v 41 tekih; vaš načrt 15,1 s«.
- Hitrosti, s katerimi so se igralci dejansko premikali - tek, hoja, počep, iz stolpcev hoje in počepa tabel - v m/s.

## Koraki {#steps}

Vrstica pod pogledom vsebuje korake. Načrt se začne z enim; **+** doda enega, vsaka figura pa se začne tam, kjer se je končala njena pot v zadnjem koraku; **−** odstrani prikazanega. **Sekunde** so, koliko traja prikazani korak pri predvajanju. **▶** (K) predvaja od prikazanega koraka do konca: figure s potjo jo prehodijo, figure, premaknjene na novo mesto v naslednjem koraku, zdrsnejo tja, ostale stojijo. Medtem ko je korak prikazan, je mesto vsake figure v naslednjem koraku narisano kot bled duh, puščice zadnjega koraka pa bledo pod tem.

## Shranjevanje {#saving}

Razdelek **Datoteka** vsebuje **Shrani**, **Odpri** in **Počisti**. **Shrani** zapiše načrt kot `<ime>.h3dplan.json` (navaden JSON: strani, koraki, figure z mestom na korak, puščice, območja, opombe); **Odpri** ga prebere nazaj. Datoteka druge različice ali tista, ki ni načrt, je zavrnjena z razlogom. **Počisti** izprazni načrt; Razveljavi ga povrne.

## Figure {#figures}

Vsako figuro zgradi sam pregledovalnik: preproste oblike do objavljene velikosti tipa, z značilnostmi, ki jo ločijo od sosedov - kolesa in kupola tanka, topovi, rakete in radarji vozila protiletalske obrambe, tloris kril, rep in motorji letala, rotorji in kratka krila helikopterja. Nič ni vzeto iz igre. Oblika, ki jo je izumila igra, je prikazana kot splošna figura njenega razreda. Kako podatki najdejo svojo figuro, glejte [Figure](figures.md#which-figure-a-unit-gets).

## Obvestilo Riot {#riots-notice}

Zemljevidi Valoranta so prikazani po politiki Riot Games »Legal Jibber Jabber«, ki dovoljuje brezplačnim skupnostnim projektom njihovo uporabo in zahteva to obvestilo, kjerkoli se pojavijo: *3DHeat je bil ustvarjen po politiki Riot Games »Legal Jibber Jabber« z uporabo sredstev, ki jih ima v lasti Riot Games. Riot Games tega projekta ne podpira in ni njegov sponzor.* Sposobnosti na tabli so splošne oblike, ne umetniška dela Riota.
