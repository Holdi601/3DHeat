---
title: "Množinska analiza"
nav_order: 8
lang: "sl"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Množična analiza: na tisoče tekem naenkrat

**Množična analiza** pokaže, kaj skupaj pomeni cela mapa tekem: kateri vozilo zmaguje največ, katera stran ima prednost, kje je dogajanje. Uporabite jo, kadar imate veliko več tekem, kot bi jih mogli pogledati.

Dela iz majhnega povzetka vsake tekme, zato se tisoč ali deset tisoč tekem odpre hitro. Polne vrstice naloži samo za tekme, na katere kliknete.

## Preizkusite {#try-it}

1. Odprite **Množična analiza** v stranski vrstici Toplotna karta.
2. Pritisnite **Mapa...** (ali **Datoteke...**) in izberite svoje tekme `.3dheat`.
3. Počakajte, dokler plošča bere povzetke ("Povzetki... n od N").
4. Pritisnite **Odpri analizo**. Odpre se okno z zavihki.
5. Nastavite filtre (Igra, Zemljevid, Način, Iz, V), nato preberite zavihek, na primer Ravnotežje.
6. Kliknite vrstico, celico ali ugotovitev: njene tekme se naložijo v 3D pogled, kamera pa je na tem mestu.

![Zavihek Ravnotežje: stopnja zmag in ubitja na smrt po vozilu](../assets/img/en/mass-balance.webp)

```
mapa datotek .3dheat -> povzetki -> okno (zavihki) -> klik na vrstico -> tekme se odprejo v 3D
```

Datoteka `.3dheat` je ena tekma ([Ena datoteka na tekmo](container.md)). *Toplotna karta* in *vrstica* sta razložena v [slovarčku](glossary.md).

## Pridobitev povzetkov {#getting-the-summaries}

Večina ljudi ne mora storiti ničesar: plošča sama izračuna manjkajoče povzetke. Če želite veliko mapo pripraviti enkrat, uporabite spodnje orodje brez povezave.

Vsaka tekma `.3dheat` dobi povzetek (`src/mass/summarize.ts`), shranjen v
vsebniku kot člen `<match>.summary.json` (vloga `summary`, glej
[Ena datoteka na tekmo](container.md)). Orodje brez povezave jih zapiše in
kazalo za vsako mapo. Je orodje za razvijalce; zaženite ga na veliki mapi, da plošči
prihranite delo:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Tekma, ki je že povzeta (ista oblika zapisa), se samo prebere; `--force`
  jo izračuna znova. `--no-write` pusti vsebnike nedotaknjene.
- Datoteka, spremenjena v zadnjih `--settle` minutah (10), je izpuščena: pretvornik
  jo morda še zapisuje.
- `<folder>/3dheat-index.jsonl.gz`: ena vrstica na tekmo – njena pot, velikost, čas
  in povzetek brez mreže. `<folder>/3dheat-index.grids.jsonl.gz`: ena vrstica na
  tekmo z njeno mrežo.
- Zaženite ga na računalniku, ki hrani datoteke, z nizko prednostjo (na primer `nice -n 19 ionice -c3` na Linuxu).

Plošča za vsako tekmo vzame prvo od teh možnosti: vrstico kazala mape (ista
pot in velikost), predpomnilnik brskalnika (IndexedDB, po imenu, velikosti in
času), člen `summary` v vsebniku ali povzetek, izračunan v skupini delavcev in
shranjen v predpomnilniku. Zato mapa brez kazala deluje tudi – prvič s hitrostjo
branja tabel, potem iz predpomnilnika.

## Plošča {#the-panel}

Izberite mapo (ali datoteke; **Dodaj mapo...** doda še eno). Okno ima filtre **Igra**, **Zemljevid**, **Način**, **Iz** in **V**, izbiro **Deli po**, **Najmanj življenj** in **Samo igralci** ter te zavihke. Vsako število prihaja iz povzetkov, klik na vrstico, celico ali ugotovitev pa naloži njene tekme v pogled kot prekrivanje mnogih tekem s filtri, ki jo prikažejo (vozilo, razred, orožje, ekipa, igralec), kamera pa je na tem mestu:

| Zavihek | Kaj |
|---|---|
| Pregled | tekme, ure, igralci, življenja, vrstice, datumi; tekme na dan; po igri, zemljevidu, načinu; skupna števila dogodkov; gospodarstvo po valuti; kdaj v tekmi se kaj zgodi |
| Ravnotežje | po vozilu, razredu, orožju ali ekipi, deljeno po zemljevidu, načinu, stopnji ali igri: K/D z njegovim ~95-odstotnim intervalom, stopnja zmag (Wilson), preživetje, ubitja in zadetki na minuto, zaslužek na minuto ter q – lažna stopnja odkritij Benjamini-Hochberg za K/D in zmago proti preostanku delitve. **Najmanj življenj** skrije vrstice s premalo življenji, da bi jim verjeli; **Samo igralci** izpusti to, kar je vodila umetna inteligenca misije |
| Trendi | delež uporabe (delež prisotnosti), K/D ali stopnja zmag najboljših vozil ali razredov na dan, teden ali mesec |
| Igralci | različni igralci, tekme na igralca, igralci na tekmo, najpogostejši igralci |
| Strani | vsaka stran vsakega zemljevida: tekme, dobljene proti enakomerni delitvi |
| Zapleteni položaji | podatki o krogih: uvodni dvoboji po strani in njihova pretvorba, izmenjave, tisti, ki pokuka, proti tistemu, ki drži, križni ognji, vstopi pod bliskom, cilj, postavitve, prednost moštva in, **Po zemljevidu**, mesta, kjer umrejo igralci, ki tam vstopajo – vsak kot delež z Wilsonovim intervalom iz števil `cqb` v povzetkih ([Zapleteni položaji in krogi](close-quarters.md)) |
| Površine R6 | sledi Rainbow Six Siege na ravni (luknje od krogel in podobno) po površini ravni: sledi, na krog zemljevida, prostor, delež sledi z ugotovljenim strelcem; klik odpre vrste sledi, operaterje in razrede orožja strelcev ter kje na površini so sledi (majhna toplotna karta iz celic po četrt metra); površina obdrži svoj id čez tekme ene različice zemljevida. Iz števil `marks` v povzetkih |
| Zemljevid | seštet mreža zemljevida: prisotnost, ubitja, smrti, K/D, vsak dogodek, tok in **vroče v koliko tekmah** (stabilnost); po ekipi, pri 1, 2, 4 ali 8-kratniku celice |
| Mesta | mesta, ki izstopajo v številkah, a ne v toplotni karti (velik prostor, ki je zaseden kot celota, koridorji, višinski pasovi) in mesta, katerih držalci dobijo več ali manj svojih krogov; **Poišči mesta** |
| Niše | skupine, ki gredo občutno bolje ali slabše od ostalih (vozilo na enem zemljevidu, sektor na eni višini) in skupine krogov, dobljenih nad tem, kar je njihova stran dobila v istih tekmah; **Poišči niše** |
| Ugotovitve | množični detektorji in detektorji zemljevidov (spodaj); **Kopiraj poročilo (JSON)** da JSON, ki ga bere jezikovni model |

## Ugotovitve čez mnogo tekem {#insights-over-many-matches}

Zavihek **Mesta** najde mesta, ki izstopajo v številkah, a ne v toplotni karti – velik prostor, zaseden kot celota, koridor, višinski pas, mesto, zaseden samo v enem delu tekme –, označi tiste, ki jih navadna toplotna karta ne pokaže, kot **skrite**, in jih obriše v 3D pogledu; **Naloži** tja poleti s tekmami, ki jih je hranil. Zavihek **Niše** najde skupine (vozilo na enem zemljevidu in strani, sektor na eni višini), ki gredo občutno bolje ali slabše od ostalih; kliknite eno, da vidite njene natančnejše podskupine.

### Kdo je zmagal {#who-won}

Kjer tekme povedo, kdo je dobil vsak krog ([stolpec izida](data-formats.md#outcome-columns) `won`), je izid samostojen cilj:

- **Mesta: delež zmag.** Za vsako stran delež njenih krogov na mestu, ki jih je dobila, proti deležu, ki ga je dobila kjer koli v isti tekmi - tako je osnova uravnoteženost zemljevida, strani in tekme same, izstopajo pa le mesta, katerih držalci dobijo več (ali manj) svojih krogov. Izmišljen primer: *»Dust: stran T dobi več svojih krogov, ko je tu: dobljenih 61 % od 412, proti 49 %, pričakovanim iz njene lastne stopnje v istih tekmah (obeti 1,6×; držano v 31/48 tekmah).«* Enaka stopnja lažnih odkritij in preverjanja stabilnosti kot pri vsakem mestu; **Naloži** naloži tekme, v katerih je veljalo, in prikaže položaje te strani.
- **Niše: zmaga v krogu.** Tabela **Krogi** hrani krog vsakega življenja: zemljevid, stran, del tekme (krogi 1-4, 5-8, ...), vozilo (operater, agent), orožje, ki ga je uporabljal največ, mesto, ki ga je držal najdlje, nakup (eco, force, full) in ali je njegova stran dosegla prvo ubitje. Skupina se presoja proti temu, kar je njena stran dobila v istih tekmah, zato je *T na Dust z AWP* niša le, kadar so bili ti krogi dobljeni pogosteje kot drugi krogi strani T v teh tekmah. Izmišljen primer: *»m1 · T · AWP: dobi 80 % od 320 krogov, proti 62 %, pričakovanim od istih strani v istih tekmah (obeti 2,3×; 40 tekem).«* Razvrščeno po dvigu, pomnoženem s podporo; **Naloži** naloži tekme, katerih krogi to najbolj kažejo.

Oboje potrebuje povzetke različice 2 (glejte [Pridobitev povzetkov](#getting-the-summaries)): starejši se izračunajo znova.

Zavihek **Ugotovitve** najde čez vse tekme vozila, ki trgujejo ali zmagujejo bolje ali slabše od ostalih, mesta, vroča v stalnem deležu tekem, strani, ki zmagajo več kot enakomerna delitev, vozila, katerih uporaba se spreminja z datumi, in dele tekme, ki zadržijo več ubitij, kot bi jih dala enakomerna razporeditev. Vsaka ugotovitev ima svoje števce, učinek, interval in lažno stopnjo odkritij (držana na 5 %), klik pa naloži njene tekme. Podrobnosti: [Za razvijalce](#for-developers).

## Obseg {#scale}

Majhno različico tega lahko ponovite sami: `node tools/demo-data.mjs` zapiše 150 sintetičnih tekem s tanki v `tools/.shots/demo/mass` (približno 1.000 vrstic na tekmo). Izmerjeno na teh 150 sintetičnih demo tekmah iz `tools/demo-data.mjs` na namiznem računalniku (prava tekma je veliko večja):

- `tools/3dheat-summarize.mjs` s 4 delavci: 2,6 do 4,8 s za vseh 150, 8 do 21 ms na tekmo znotraj delavca; drugi zagon, ki samo bere povzetke, traja približno 2 s.
- Odpiranje mape v plošči, ko je kazalo prisotno, dokler se okno ne prikaže: 0,9 do 1,6 s (lastni del delavca, branje 150 vrstic kazala, je 20 do 40 ms).
- Preklop na zavihek, dokler se njegova tabela ne nariše: Pregled 10 do 30 ms, Ravnotežje 30 do 70 ms, Trendi 30 do 45 ms, Igralci 15 do 35 ms, Strani 15 do 20 ms, Zemljevid 55 do 130 ms.
- Shramba drži 150 tekem v približno 0,5 MB.

Odpiranje okna traja en kratek kader: izbrane datoteke gredo delavcu po 16 naenkrat, polja za datum in prvi zavihek pa se prikažejo kader kasneje kot okno.

Shramba zadrži približno 15 KB na tekmo, zato 10.000 tekem zavzame ~150 MB v
delavcu; mreže se nikoli ne hranijo dlje, kot jih zahteva zemljevid.


## Za razvijalce {#for-developers}

### Ugotovitve čez mnogo tekem {#insights-over-many-matches}

`src/mass/detect.ts` – vsaka ugotovitev s svojimi števci, učinkom in intervalom,
p in q (Benjamini-Hochberg čez vse, kar je detektor preizkusil, držano na 5 %),
poglobitev, ki naloži njene tekme, in ključ stavka z vrednostmi;
poročilo (`heat3d.mass/1`) je tisto, kar `massReportForModel` poda
pripovedovalcu, v isti obliki kot poročilo ene tekme (`insights/seam.ts`).

| Detektor | Najde |
|---|---|
| `balance` | vozilo igralca, ki trguje ali zmaguje bolje ali slabše od ostalih na zemljevidu ali v načinu |
| `hotspot` | mesta, vroča v stalnem deležu tekem, ki so prišle (vroče tekme / videne tekme, proti drugim celicam zemljevida) – ne samo vroča v vsoti |
| `side` | stran zemljevida, ki zmaguje več kot enakomerno delitev |
| `meta` | delež življenj igralcev vozila ali njegov K/D, ki se premika med prejšnjo in poznejšo polovico datumov, na zemljevid – dovolj velik, da šteje, kaže trend čez četrtletja in se enako obnaša na večini zemljevidov (spodaj) |
| `phase` | del dolžine tekme, ki zadrži več ubitij, zadetkov, izstrelitev ... kot enakomerna razporeditev |
| `place` | mesta, ki izstopajo čez mnogo tekem (faza B, spodaj): stopnja območja ali delež ubitij proti lastni meri vsake tekme, krogi, koridorji, zrasla območja, višinski pasovi, faze; skrita, kadar je navadna toplotna karta ne pokaže |
| `niche` | skupine, ki gredo občutno bolje ali slabše (faza B, spodaj) |
| `grid.*` | detektorji enega nabora podatkov (položaji moči, vroča in tiha območja, razredni položaji) na seštetih mrežah vsakega zemljevida: `GridMerge.toInsightJob` napolni mreže prehoda ugotovitev iz povzetkov; detektorji, ki potrebujejo sledi, jih preskočijo |

### Povzetek {#the-summary}

Navaden JSON (`src/mass/types.ts`), približno 5–30 KB stisnjen na tekmo:

- tekma: igra, zemljevid, način, misija, začetek, dolžina, vrstice, življenja, igralci,
  umetna inteligenca, ekipe (življenja, igralci, prisotnost, ubitja, smrti, zmaga, denar), zmagovalec;
- na vozilo in ekipo: razred, stopnja, življenja, življenja igralcev, prisotnost, dogodki
  po kanonični vrsti, ubitja po razredu tarče, zmage, denar;
- na igralca (po id-ju uporabnika, sicer po imenu): ekipa, življenja, prisotnost, ubitja, smrti,
  zadetki, izstrelitve, zmage, vozila; na orožje: dogodki po vrsti;
- s stolpcem izida (različica 2): dobljeni in odigrani krogi na ekipo, vozilo
  (`rw`, vsako življenje in krog), igralca in orožje (krogi, v katerih ga je
  stran uporabila); krog vsakega življenja (`outcome.u`: krog, stran, vozilo,
  največ uporabljeno orožje, najdlje držano mesto, nakup, zmaga) ter številka,
  zmagovalec in stran prvega ubitja vsakega kroga (`outcome.r`);
- stolpci gospodarstva (`cost_*`, `earn_*`) in njihove vsote;
- faze: dogodki po vrsti v 20 predelkih dolžine tekme in po minuti;
- vedenje: merila skupnega vedenja tekme (poravnava, vodenje na poti, pasovi, gneča,
  vodje, zaostalci, točka zloma, tveganje po izgubah, nizi, dogovor o nakupih, zatiranje),
  vsako s svojim ničelnim modelom, p in q – glej [Skupno vedenje](collective-behaviour.md);
- mreža (spodaj).

Šteto tako, kot šteje gledalec: stolpci, najdeni tako, kot jih najde nalagalnik
množičnih tekem (`leanSpec`), dogodki po `data/canonical.ts`; ubitje, ki ga orožje
Tacview šteje za strelca; smrt, rečena dvakrat hkrati (`dead`, `death`), šteje
enkrat.

#### Mreža: na čem gradi faza B {#the-grid-what-stage-b-builds-on}

Prostorski del je narejen za statistiko skeniranja območij poljubne velikosti in
oblike, ne samo za slike toplotne karte:

- **Piramida.** Celice so poravnane potence dveh v svetovnih enotah (x, z, kot ju
  gledalec postavi). Stopnja `k` so celice, seštete po `ix >> k, iz >> k` –
  natančno, znotraj tekme in čez tekme z drugimi velikostmi celic – in poljubno
  območje (škatla, koridor vzdolž črte, obroč) je vsota celic. Najfinejša stopnja se
  prilega robustnemu obsegu tekme (celice, ki držijo 99 % prisotnosti) v 128
  celicah; tiste zunaj so ohranjene.
- **Izpostavljenost ob vsakem številu.** Sekunde prisotnosti na celico, na ekipo
  (`pt`), na razred vozila (`pc`) in na višinski pas (`ph`), zato se stopnja, pričakovanje
  in razmerje območja izračunajo za poljubno podskupino.
- **Višina.** Pasovi nad dnom tekme (1. percentil višine): pod 3 m, 3–10, 10–30,
  30–100, 100–300, 300–1000, 1000–3000, nad; datoteka s stolpcem `floor`/`storey`/`deck`
  razvrsti po nadstropjih. `y` je srednja višina vsake celice, `y0` njena najnižja
  (njeno nadstropje, za višino nad njim).
- **Dogodki** kot torke `[cell, kind, team, class, band, count]`.
- **Krogi po izidu** (različica 2, s stolpcem izida in vsaj dvema krogoma):
  `pw` kot `[cell, team, rounds won, rounds lost]` - krogi, v katerih je vsaka
  stran preživela v celici sekundo ali več, po njenem izidu v krogu.
- **Časovni rezi** na grobi stopnji (8 celic na stran), po minuti od začetka tekme:
  `[cx, cz, minute, kind, value]`, sekunde prisotnosti kot vrsta `GRID_KINDS.length`;
  faze tekme so minute čez dolžino.
- Redko, števci celi, sekunde na desetinko: omejeno s tem, kar se je zgodilo.

### Faza B: mesta in niše {#stage-b-places-and-niches}

Faza B išče to, kar izstopa v številkah, a ne pade v oči: velik prostor, zaseden kot
celota brez vroče celice v njem, nenavadno razmerje ubitij in smrti pri malo
dogodkih, koridor, višinski pas, grozd, ki je tam samo v enem delu tekme – in
skupine (vozilo na enem zemljevidu na eni strani, sektor na eni višini), ki gredo
občutno bolje ali slabše od ostalih. Ena akcija **Poišči mesta** / **Poišči niše** /
**Poišči ugotovitve** požene vse detektorje; tri zavihki delijo isto poročilo.

#### Mesta (`src/mass/scan.ts`) {#places-srcmassscants}

Tekme vsakega zemljevida se preberejo dvakrat, po ena tekma naenkrat; spomin drži
vsote na rastru največ 64 celic na stran (16 za skeniranje prostor-čas), nikoli
tekem.

- **Merila.** Stopnja dogodka na sekundo prisotnosti – ubitja, smrti,
  zadetki, izstrelitve, zajetja, za vse enote, na razred (4 z največ
  dogodki), na višinski pas – in delež ubitij v ubitjih in smrteh (vse, na stran,
  na pas) ter **delež zmag** vsake strani: njeni krogi v celici, dobljeni proti
  izgubljenim (`pw`), kjer se pri 8 ali več tekmah zemljevida štejejo krogi po
  izidu. Kateri razredi in strani pridejo iz glav (`planOf`).
- **Pričakovanje na tekmo.** Stopnja vsake tekme, razporejena po njeni lastni
  prisotnosti v celici, je pričakovanje celice (Kulldorffovo skeniranje, prilagojeno
  kovariatam in razslojeno po tekmi): nekaj krvavih tekem ali en zaseden strežnik ne
  naredi mesta. Za delež zmag je pričakovanje lastni delež dobljenih krogov
  strani v tej tekmi, zato uravnoteženost zemljevida in strani nikoli ni mesto.
  Krog v več celicah območja šteje v vsaki; to upošteva razpršenost, izmerjena
  pri velikosti območja.
- **Razpršenost.** Tekme se močno razlikujejo od Poissonove porazdelitve. Ostanki
  vsake tekme se seštejejo v blokih 1, 2, 4, 8, 16 celic; razpršenost vsake velikosti
  bloka (kvadrirani ostanki, deljeni z ničelno varianco, združeni, najslabših 5 %
  blokov izpuščenih) skalira vsak preizkus območja te velikosti: kvazi-verjetnostno
  razmerje, Poisson za stopnje, binomsko za deleže.
- **Območja.** Krogi od 0,75 do 18 celic; elipse pod šestimi koti, 3- in 6-krat tako
  dolge kot široke, 3 do 18 celic (koridorji; os je `place.path` ugotovitve);
  cone, zrasle celico za celico iz najmočnejših lokalnih celic Getis-Ord Gi* dokler
  z območjem raste z (nepravilne oblike) – zrasle na eni polovici tekem in preizkušene
  na drugi, zato svoboda rasti ne stane lažnih mest; vsak višinski pas proti ostalim
  pasovom tekme na celotnem zemljevidu (robustno za grozde); valji prostor-čas: krog
  v eni ali dveh petinah dolžine tekme, proti lastnemu razpršitvi dogodkov tekme po
  mestu in času (skeniranje permutacije prostor-čas).
- **Testiranje.** p iz kvazi-verjetnosti; Benjamini-Hochberg čez vsako območje, preizkušeno
  na vsakem zemljevidu (700.000 na treh zemljevidih je običajno), pri 5 %. Kar
  prestane, se okrnji (območje, ki je večinoma znotraj močnejšega iz istega merila,
  pove isto), nato se ponovno prebere za njegovo **stabilnost** – tekme, ki so ga videle,
  tekme, v katerih je bilo, njegova smer v petih naborih tekem – in še enkrat preizkusi
  pri razpršenosti, ki jo kažejo same tekme (robustno za grozde, tekme kot grozdi,
  nikoli pod Poissonom), BH spet. Tiha mesta na osnovi (2 % ali več
  pojavitev, vzletov in pristankov zemljevida) so izpuščena.
- **Učinek.** Razmerje stopenj (ali obetov), skrčeno z empiričnim Bayesom (gama
  predpostavka, prilagojena 2x2 blokom zemljevida), z ~95-odstotnim intervalom pri
  razpršenosti; Gi* pri 1, 2 in 4 celicah ter lokalni Moran v središču.
- **Vidna očitnost.** Kolikšen del območja že kaže navadna toplotna karta njegovega
  dogodka (logaritemska lestvica do najsvetlejše celice, kot jo rišejo pogledi):
  njegov kontrast z obročem okoli njega (desetina palete je težko videti, dve petini
  sta navadni) in svetel vrh, ki nosi presežek; razmerja toplotna karta nikoli ne riše,
  zato delež šteje polovično. Pod 35 % je **skrito**. Vrstni red: moč (učinek, ki
  nasiči pri 4-kratniku, tihi mesta pri 0,7) krat `1 - 0,7 x očitnost` krat
  soglasje zvitkov.

Zavihek **Mesta** jih našteje (privzeto samo skrite; po zemljevidu, obliki,
smeri), klik obriše mesta zemljevida v 3D pogledu (`placeLines.ts`: zgornje
črte motorja, zgrajene enkrat – skrite magenta, navadne jantarne, tihe cian,
izbrana polna; pas kot škatla od svojega dna do stropa) in na platnu zavihka
Zemljevid; **Naloži** tja poleti in naloži 60 tekem, v katerih je bilo največ, filtrirano
na njegov dogodek (in razred).

#### Niše (`src/mass/niche.ts`) {#niches-srcmassnichets}

Iskanje žarka (širina 24, globina 3) čez tri tabele: **življenja** (življenja igralcev:
igra, zemljevid, način, razred, vozilo, stran, stopnja, četrtletje datumov, tretjina
dolžin tekem; K/D, zmaga, smrt življenja, ubitja na uro, zaslužek na minuto),
**mesta** (ubitja in smrti po zemljevidu, načinu, datumih, sektorju zemljevida
4 x 4, razredu, strani, pasu) in **faze** (sektor in peta tekme: K/D, smrti na uro
prisotnosti). Skupina se preizkusi proti celoti z tekmami kot grozdi (sendvič varianca
njenih ostankov po tekmi), njen učinek je razmerje obetov ali stopenj, skrčeno s
predpostavko 20 izidov; potrebuje 30 izidov v 8 tekmah, izboljšava mora biti 10 %
močnejša od svojega starša, skupine, kjer je izid nič ali vse (ni zabeležen zanje),
so izpuščene. Ohranjene: BH pod 5 % čez vse ocenjene skupine, skrčeno razmerje vsaj
1,25 (ali 1/1,25), štirje od petih naborov se strinjajo, izboljšava, ki samo ponavlja
svojega starša, ni ohranjena. Zavihek **Niše** jih našteje; klik pokaže vsako izboljšavo
skupine z enim pogojem (raziskovalec), **Naloži** naloži njene tekme. Nabori orožja
še niso v povzetkih.

Četrta tabela, **krogi** (`roundsTable`), ima za cilj izid kroga: ena vrstica
je krog enega življenja - zemljevid, stran, del tekme (krogi 1-4, 5-8, ...),
vozilo, največ uporabljeno orožje, najdlje držano mesto, nakup, prvo ubitje ali
prva smrt - presojano proti deležu zmag lastne strani v lastni tekmi
(razslojeno pričakovanje Mantel-Haenszel: ostanek je `won - e`, `e` delež strani
v tekmi), zato niša nikoli ni uravnoteženost zemljevida ali strani. Gruče
ostajajo tekme. Njen z je umerjen: isto iskanje s snopom teče osemkrat na
izidih, premešanih med krogi vsake strani vsake tekme (delež strani v vsaki
tekmi ostane), in razpršenost teh ničelnih z nad standardno normalno
porazdelitvijo - za vsako število pogojev, iz sredine (mediana / 0,674) in iz
repa (99. percentil / 2,576), večja od obeh, nikoli pod 1 - deli prave z pred
njihovim p in stopnjo lažnih odkritij (empirična ničelna, Efron 2004). Globlje
skupine dobijo večje merilo: snop obdrži izpopolnitve skupin, izbranih zaradi
velikega z. Osnova niše je njeno lastno pričakovanje, njen dvig so točke nad
njim, razvrsti pa se po dvigu, pomnoženem s kvadratnim korenom števila njenih
krogov, ob izpolnjenih dokazih in pregibih (`wracc` je podpora, pomnožena z
dvigom). Nosi tekme, kjer se je pokazala najbolj (`matchIds`), in nekaj
njihovih krogov (`rounds`, `[match, round]`) za podroben pogled.

#### Premiki mete s praktičnim pomenom {#meta-shifts-with-practical-significance}

Pri mešanih datumih je binomska na življenjih skoraj vsako spremembo označila kot
pomembno. `meta` zdaj preizkuša robustno za grozde (življenja vsake tekme so grozd),
ohrani premik uporabe samo za 2 točki in vsaj 25 %, premik K/D za 1,3-kratnik, četrtletja
datumov, ki trendirajo v isto smer (Kendallov tau vsaj 0,5), in za vozilo na več
zemljevidih isto smer na večini od njih. Tako ostane le nekaj premikov na testni
množici, kjer je navadni preizkus označil skoraj vse.

#### Za model {#for-a-model}

`massReportForModel` da vsakemu mestu njegovo `region` (oblika, skrito,
očitnost, višine, faza) in vsaki niši njene `conditions`, plus koliko območij in
skupin je bilo preizkušenih. Pregled znanja lahko bere mesta kot območja ubijanja in
pristope: njihove vrste so `place.*` in `niche.*`.

#### Preverjanja {#checks}

`scan.test.ts` zasadi razpršeno območje (1,6-kratna stopnja smrti čez krog
22 celic, šibko v vsaki celici), koridor, višinski pas in grozd samo v eni fazi v
240 sintetičnih tekmah s presežno razpršenostjo – vse najdeno, razpršeno skrito – in
zažene osem ničelnih naborov po 60 tekem: nobenega mesta. `niche.test.ts` najde
zasajeno skupino vozilo x zemljevid x stran in ničesar v petih ničelnih tabelah.
`outcome.test.ts` preveri povzetek različice 2 (dobljeni krogi po strani,
enoti, igralcu in orožju, `pw`, krogi enot); zasadi pas, katerega stran dobi
70 % svojih krogov proti 35 % (vsaka tekma s svojo uravnoteženostjo) - najden -
in zažene 20 ničelnih naborov po 50 tekem, kjer pasovi ne povedo ničesar:
nobenega mesta deleža zmag; zasadi AWP na enem zemljevidu, ki dobi kroge svoje
strani za 30 točk več - najden, z njegovimi tekmami in krogi - in zažene 30
ničelnih naborov po 80 tekem, kjer ima vsaka tekma svojo uravnoteženost in je
ena stran močnejša na enem zemljevidu: nobene niše.

