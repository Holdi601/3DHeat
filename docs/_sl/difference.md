---
title: "Razlika"
parent: "Načini toplote"
nav_order: 5
lang: "sl"
source: "difference.md"
source_hash: "12fc27dc0616"
translated: true
outdated: false
---

# Razlika

Rdeča tam, kjer je bila ekipa A več, zeleno-modra tam, kjer je bila ekipa B, nič tam, kjer sta bili enaki.

**Razlika** (tipka 2) je toplota z predznakom. Vrstice ene populacije toploto prištevajo, vrstice druge jo odštevajo. Kjer se obe prekrivata enakomerno, je rezultat nič in popolnoma prosojen; kjer prevladuje ena, se prikaže v barvah te strani - privzeto toplo (prosojno → rdeče → rumeno → belo) za stran **+** in hladno (prosojno → zeleno → modro → vijolično) za stran **−**.

![Toplota razlike: rdeče tam, kjer je bila stran + več, zeleno in modro tam, kjer je bila stran − več](../assets/img/sl/difference-split.webp)

## Uporaba {#how-to-use-it}

1. Pritisnite `2` (ali izberite **Razlika** v vrstici načinov).
2. V stranski vrstici odprite **Delitev razlike**.
3. Izberite, po čem **Delite**: običajno *Skupine*.
4. Eno skupino (ali vrednost) postavite na **+**, drugo na **−**.
5. Preberite barve: toplo pomeni stran +, hladno pomeni stran −. Plošča opozori, če ena stran nima vrstic (glejte [Sporočila, ki jih lahko vidite](#messages-you-may-see)).

*Kateri* dve populaciji sta celotno vprašanje, zato je lahko delitev po katerem koli ohranjenem stolpcu, ne samo po skupinah. Vrstice, ki pristanejo na **nobeni** strani, so **izpuščene**, ne štejejo se kot nič: prav zato delitev čez dve od mnogih vrednosti primerja točno ti dve, in se sestavi s [filtri](filters.md) - filtrirajte na en zemljevid, nato to delite po različici.

Način potrebuje dve strani: stolpec skupine z vsaj dvema skupinama ali delitev čez stolpec, ohranjen za filtriranje. Pri podatkih z manj kot dvema skupinama nalaganje začne z delitvijo po stolpcu - najprej stolpec *Vir datoteke* pri nalaganju več datotek, sicer prvi stolpec kategorije z dvema vrednostma, sicer prvi številski stolpec z razponom - tako da *primerjava dveh nalaganj* deluje tudi pri podatkih brez skupin. Samo podatki brez obojega naredijo način nedosegljiv; tako tudi delitev stolpca, ki na eni strani ne ostane nič.

## Plošča Delitev razlike {#the-difference-split-panel}

Prikazana v načinu Razlika, pod ploščami toplote.

**Deli po** ponuja:

| Možnost | Prikazano kot | Pravilo delitve |
|---|---|---|
| Skupine | *Skupina (N)* (kadar je stolpec skupine) | Vsaka skupina na +, − ali nobeni, nastavljeno v [Seznamu ekip](teams-list.md) |
| Stolpec kategorije | *stolpec (N vrednosti)* | Vrednosti na +, − ali nobeni |
| Številski stolpec | *stolpec (številski)* | Razpon vrednosti za vsako stran |
| Datoteka izvora | *Vir datoteke - primerjaj dve nalaganji* (kadar je bilo naloženih več datotek) | Datoteke na +, − ali nobeni |

Ponujeni so samo stolpci, ki so bili pri nalaganju ohranjeni pod *Ohrani za filtriranje*.

### Primerjaj deleže, ne števil {#compare-shares-not-counts}

**Primerjaj deleže, ne števil** (privzeto izklopljeno) utež vsake strani določi kot ena deljeno z njenim lastnim številom vrstic, zato stran s petkrat več vrsticami ne zmaga samo zaradi števil. Barva nato pokaže, kje je vsaka stran sorazmerno pogostejša od druge. Uporabite jo, kadar imata strani zelo različne količine podatkov, na primer dve seji različne dolžine.

### Sporočila, ki jih lahko vidite {#messages-you-may-see}

Plošča opozori, kadar slika ni prava razlika:

| Sporočilo | Pomen |
|---|---|
| *N + / M −* (ali *N + / M − / K neuporabljenih*) | Koliko vrednosti je na vsaki strani (in na nobeni). |
| Nobena vrstica v oknu ni na strani **+** | Riše se samo stran **−**. Premaknite okno časovnice ali spremenite delitev. |
| Nobena vrstica v oknu ni na strani **−** | Riše se samo stran **+**. |
| Nobena vrednost ni na nobeni strani | Razlika nič ne riše. Na **+** ali **−** postavite vsaj eno vrednost. |
| *stolpca* ni mogoče razdeliti na ta način | Izbrani stolpec ne ustreza delitvi. Ponovno izberite stolpec. |
| Stolpec delitve se ni prilegal v pomnilnik GPU za N od M kosov | Te vrstice se ne narišejo. Povečajte proračun GPU pod Zmogljivost → Proračuni virov ali naložite manj vrstic. |

### Po skupini {#by-group}

Plošča samo kaže na [Seznam ekip](teams-list.md), kjer ima vsaka skupina gumb **+** in **−**. Ob vsakem nalaganju se prva polovica skupin (zaokrožena navzgor) da na +, ostale na −; **Razdeli enakomerno** v Seznamu ekip naredi isto še enkrat. Skupina na nobeni strani ali skrita s potrditvenim poljem ne prispeva nič.

### Po vrednostih kategorije {#by-category-values}

| Del | Pomen |
|---|---|
| `a + / b − / c neuporabljenih` | Koliko vrednosti je na vsaki strani in na nobeni. |
| **Počisti** | Vsako vrednost da na nobeno stran. |
| Seznam vrednosti | Vsaka vrednost z gumbom **+** in **−** (aktivnega kliknite znova, da ga odstranite s te strani). Prazna vrednost je navedena kot *(manjka)*. |
| Opomba o omejitvi | Navedenih je samo prvih 200 vrednosti: *Prikazanih prvih 200 od N vrednosti. Tako širok stolpec je bolje najprej zožiti s filtrom ali razdeliti po razponu, če so vrednosti urejene.* |

Ko izberete stolpec, se njegova prva vrednost postavi na + in druga na −. Kadar nobena stran nima nobene vrednosti, delitev pade nazaj na skupine namesto da bi pokazala prazen okvir. *Vir datoteke* deluje enako, ena vrednost na datoteko - tako primerjate dva izvoza, dva preskusa ali dve različici.

### Po razponu {#by-range}

| Del | Pomen |
|---|---|
| Namig | Najmanjša in največja vrednost stolpca. |
| **Pozitivni razpon (+)**, **od** / **do** | Vrstice z vrednostjo v tem razponu, vključno z obema robovoma, se prištejejo. |
| **Negativni razpon (−)**, **od** / **do** | Vrstice v tem razponu se odštejejo. |
| **Razdeli na sredini** | Nastavi + na [najmanjša, sredina] in − na [sredina, največja] - enako, kot se zgodi ob izbiri stolpca. |

Vrednost v obeh razponih se šteje kot +. Razponi ne sejo nujno pokriti stolpca; vrednosti na nobenem so izpuščene. *Prvi dve minuti proti zadnjima dvema* je delitev po razponu na stolpcu, podobnem času.

## Barve {#colours}

Oddelek **Barve toplote** v tem načinu prikaže dva urejevalnika lestvic: **Pozitivna (prištevajoče ekipe)** in **Negativna (odštevajoče ekipe)**, vsak s svojim gumbom za ponastavitev (*Ponastavi na prosojno → rdeče → rumeno → belo*, *Ponastavi na prosojno → zeleno → modro → vijolično*). Sestavljena slika vzame absolutno vrednost neto toplote skozi [točko nasičenja in odziv](colour-and-exposure.md) in izbere negativno lestvico tam, kjer je neto pod nič. Glejte [Barva in izpostavitev](colour-and-exposure.md#the-ramp-editor).

Uporabite odziv gostote *Linearno*, kadar je velikost razlike pomembna: je edini odziv, pri katerem enaka barva pomeni enako število.

## Za razvijalce {#for-developers}

Vsaka vrstica dobi predznak +1, -1 ali 0 v senčilniku oglišč ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 zavrže vrstico, preden se nariše kateri koli fragment.

- Po skupini predznak pride iz tabele skupin s 4.096 vnosi, indeksirane z ID-jem skupine vrstice (ID skupine se prenaša v četrtem kanalu slikovnega elementa položaja vrstice).
- Po kategoriji predznak pride iz druge tabele s 4.096 vnosi, napolnjene za vsako vrednost kategorije, vrednost vrstice pa se prebere iz teksture filtra stolpca; vrednost čez konec tabele je zavrnjena na obeh zaledjih.
- Po razponu se vrednost vrstice primerja z obema razponoma.

Sprememba delitve ponovno zažene kopičenje.

**Skrite skupine ostanejo skrite pri vsaki delitvi.** Pri delitvi po stolpcu tabela skupin ne nosi več predznakov; hrani 1 za prikazano skupino in 0 za skrito ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), obe tabeli pa dosežeta senčilnik skupaj - dve vrstici ene teksture predznakov na WebGL2, dve polovici enega pomnilniškega medpomnilnika na WebGPU. Vrstica se nariše samo, kadar je njena skupina prikazana *in* je njena vrednost stolpca na strani. Torej skupina, ki ni označena v [Seznamu ekip](teams-list.md), ali je izpuščena z izbiro strani v zavihku Tekma, ne prispeva ničesar, ne glede na to, kako je razlika razdeljena.
