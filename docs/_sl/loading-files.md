---
title: "Nalaganje datotek"
parent: "Uvoz podatkov"
nav_order: 1
lang: "sl"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Nalaganje datotek

Ta stran pokaže, kako 3DHeat dasta vaše datoteke in kaj z njimi naredi. Spustite mapo, in izbere datoteke, ki hranijo položaje, ter jih združi v eno sliko.

1. Odprite **Vir** na vrhu stranske vrstice Toplotnega zemljevida.
2. Spustite datoteke ali mapo na območje za spuščanje ali pritisnite **Datoteke…** ali **Mapa…**.
3. Preberite vrstico izbire in **Oceno pomnilnika** (glejte sliko spodaj).
4. Pritisnite **Naloži**.

![Plošča Vir po spustu mape z desetimi tekmami: 1 vrstica izbire, 2 Ocena pomnilnika pri ustreza in 3 Naloži 10 datotek](../assets/img/en/loading-files-source.webp)

*Po spustu mape 3DHeat pove, kaj je našel in ali se prilega.*

Datoteke se naložijo na plošči **Vir** na vrhu stranske vrstice zavihka Toplotni zemljevid. Vse, kar je izbrano hkrati, postane **en** nabor podatkov.

## Izbira datotek {#choosing-files}

| Kontrola | Kaj naredi |
|---|---|
| **Sem spustite datoteke ali mapo** (območje za spuščanje) | Spustite poljubno mešanico datotek in map. Mape se pregledajo rekurzivno. Klik na območje za spuščanje odpre enak izbirnik kot **Datoteke…**. |
| **Ena datoteka…** | Izbirnik datotek za eno datoteko. |
| **Datoteke…** | Izbirnik datotek, ki sprejme več datotek. |
| **Mapa…** | Izbirnik mape (izbirnik brskalnika `webkitdirectory`); ponudi se vsaka datoteka v drevesu mape. |

Izbirniki sprejemajo vrste datotek iz [seznama datotek, ki jih je mogoče naložiti](data-formats.md#files). Na kratko: `.parquet`/`.pq` se berejo kot Parquet, `.csv`/`.tsv`/`.txt` kot tekstovne tabele z ločili, `.acmi` (Tacview), OCAP `.json`/`.json.gz` in formati GPS (GPX, KML, KMZ, NMEA, IGC, FIT) gredo skozi svoje lastne bralnike, vsebniki tekem `.3dheat` pa se naložijo kot tabele, ki jih hranijo ([Ena datoteka za tekmo](container.md)). Vsebnik, ki ga ni mogoče prebrati, se preskoči kot *ni csv/parquet datoteka*.

Spuščene mape se pregledajo do globine 12 ravni in največ 20.000 datotek, kot zaščita pred zankami simboličnih povezav in neobvladljivimi drevesi.

## Katere datoteke ostanejo {#which-files-are-kept}

Preden se karkoli prebere, se izbira filtrira ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Datoteka z drugo končnico se preskoči: *ni csv/parquet datoteka*.
- Datoteka velikosti 0 bajtov se preskoči: *prazna (0 bajtov)*.
- **Spremljevalne datoteke pretvornika** - surovi podatki, ki jih pretvornik hrani poleg tabele tekme, `<tekma>.messages.parquet`, `.events.parquet`, `.raw.parquet` in druge, navedene v [Pretvorniki hranijo vse](converters.md) - se preskočijo: *spremljevalna datoteka pretvornika*. Če jo želite odpreti, jo izberite ali spustite samo (ali samo spremljevalne datoteke): izbira samo spremljevalnih datotek se naloži kot katera koli tabela. JSON poleg tabele (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` in `.hints.json`) se nikoli ne ponudi kot položaji.
- **Pravilo datotek gibanja.** Če se katera koli datoteka v izbiri imenuje `movement*.parquet`, `movement*.csv` (in druge končnice) - `movement.parquet`, `movement_1.parquet` in tako naprej - se vse druge podatkovne datoteke preskočijo: *ni datoteka gibanja, in ta mapa ima datoteke gibanja*. Izvozi telemetrije pogosto hranijo eno tabelo položajev poleg desetin tabel brez položajev, narisati pa se da samo prvo. Mapa brez katere koli datoteke gibanja naloži vse svoje podatkovne datoteke. Primer: mapa z `movement_1.parquet`, `kills.parquet` in `shop.parquet` naloži `movement_1.parquet`; ostali dve sta navedeni kot preskočeni. Primer: mapa z `movement_1.parquet`, `kills.parquet` in `shop.parquet` naloži `movement_1.parquet`; ostali dve sta navedeni kot preskočeni.
- Ohranjene datoteke so razvrščene po njihovi poti znotraj izbire, zato ista mapa vedno da isti nabor podatkov in iste barve.

Plošča nato prikaže izbiro (ime ene datoteke ali `mapa (N datotek)`, pri čemer se uporabi najdaljša skupna mapa), število datotek, njihovo skupno velikost in skupno število vrstic - natančno, če so vse datoteke Parquet, označeno z `≈`, če je katera CSV. Preskočene datoteke so navedene z razlogom, prvih štiri po imenu.

## Branje sheme {#reading-the-schema}

**Prva** datoteka izbire se odpre, da opiše shemo („Branje sheme”): imena stolpcev, njenih prvih 50 podatkovnih vrstic, stolpci, ki so videti številski, in pri Parquetu logični tip vsakega stolpca ter vnos `heat3d` v nogi. Mapa izvozov ene tabele deli eno shemo, zato ena datoteka predstavlja vse. Nato se izmeri vsaka datoteka („Štetje vrstic”): noga Parquet da natančno število z enim majhnim branjem; število CSV se oceni iz povprečne dolžine vrstice prvega megabajta.

Plošča [Dodelitev stolpcev](column-mapping.md) se odpre s samodejno določenimi predlogi, [ocena pomnilnika](memory-and-budgets.md) pa se prikaže nad gumbom **Naloži**.

## Sporočila pred nalaganjem {#messages-before-loading}

Pod izbiro plošča našteje, iz [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Napake** (rdeče) - nalaganje se ne more začeti: manj kot dve osi položaja, isti stolpec na dveh oseh, preslikan stolpec, ki ga ni v datoteki, stolpec položaja, ki ne izgleda številsko, stolpec časa, katerega vzorčene vrednosti so besedilo, medtem ko je enota število (vsaka vrstica bi bila NaN in bi pristala na času 0), stolpec časa, nastavljen na ISO-8601, katerega nobena vzorčena vrednost se ne razčleni kot datum, merilo enote 0.
- **Opozorila** (jantarna) - nalaganje bo steklo, a verjetno ne tako, kot je mišljeno: stolpec skupine, ki na večini vzorčenih vrstic zavzame različno vrednost (torej je ID, ne skupina), stolpec časa `DATE` (vsaka vrstica dneva deli isti trenutek), smer pogleda nastavljena brez svojih stolpcev.
- **Opombe** - kaj preslikava pomeni: risanje na ravnini, ko ena os ni preslikana, brez časovnice brez stolpca časa, brez tirov brez stolpca osebe, in brez stolpca skupine ena barva za vse ter razlika, ki se lahko deli samo po stolpcu, ohranjenem za filtriranje.

## Nalaganje {#loading}

Gumb **Naloži** prebere *Naloži datoteko*, *Naloži N datotek* ali *Naloži N datotek (1 od K)*, kadar je nastavljen [korak redčenja](memory-and-budgets.md#decimation). Prebere *Preveliko - zmanjšajte ali redčite* in je onemogočen, kadar preizkus prileganja ([preverjanje prileganja](memory-and-budgets.md#the-fit-check)) pravi, da se nalaganje ne bo prilegalo; onemogočen je tudi, medtem ko ima preslikava napake ali teče drugo nalaganje.

Med nalaganjem plošča prikazuje trenutni korak (z `[datoteka/datoteke]` spredaj, kadar je datotek več), vrstice, prebrane doslej, vrstico napredka in **Prekliči**. Prekliči ustavi delavca za sprejem in z njim vse delavce razčlenjevalnika, ki jih je zagnal.

Stran med nalaganjem še riše, ker delo poteka v ozadju. Vidite trenutni korak, prebrane vrstice, vrstico napredka in **Prekliči**. Po zadnji datoteki plošča prikaže korake *Razvrščanje vrstic po času*, *Preurejanje stolpcev (n od m)*, *Merjenje obsega*, *Gradnja seznama*, *Povzemanje sej* in *Računanje življenjskih dob*, nato *Nalaganje N vrstic v GPU* za en okvir, da dolgega nalaganja ne zamenjate za zamrznitev.

### Kako deluje {#how-it-works}

Nalaganje teče v spletnem delavcu ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Pri več datotekah in več kot eni [niti razčlenjevalnika](memory-and-budgets.md#parser-threads) se do toliko datotek razčleni **hkrati**, vsaka v svojem delavcu razčlenjevalnika ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), kolikor proračun RAM-a pušča prostora; še vedno se združijo ena za drugo po vrstnem redu izbire, zato je nabor podatkov enak kot pri nalaganju ena za drugo. Medtem ko je več v teku, vrstica napredka navede datoteko, ki je nazadnje poročala, vrstica in število vrstic pa seštevata vsako datoteko v teku. Pri eni niti ali eni sami datoteki se datoteke razčlenjujejo ena za drugo v samem delavcu za sprejem. Prebrani so samo stolpci, ki jih imenuje preslikava: neizbran stolpec datoteke Parquet nič ne stane; CSV se pregleda bajt za bajtom, vendar se dekodirajo samo preslikana polja.

## Več datotek postane en nabor podatkov {#several-files-become-one-dataset}

Ko se naloži več datotek ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **En seznam.** Osebe, skupine, seje in vrednosti kategorij so slovarji, deljeni med vsemi datotekami, zato je isti igralec v dveh izvozih ena oseba z eno potjo.
- **Ena časovna točka.** Časi se med združevanjem hranijo kot 64-bitne sekunde in se preračunajo na najzgodnejši čas *celotne* izbire, nato pa shranijo kot 32-bitne sekunde od te točke. Štirje izvozi s štirih popoldnevov se postavijo v pravi vrstni red, ne drug na drugega.
- **En časovni red.** Vrstice iz vseh datotek se razvrstijo po času z radix razvrščanjem (glejte [mejo razvrščanja](memory-and-budgets.md#the-sort-ceiling)).
- **Stolpec `Source file`.** Vsaka vrstica si zapomni, iz katere datoteke prihaja, kot stolpec kategorije z imenom `Source file`. Pojavi se v [Filtri](filters.md) in kot *Source file - primerjaj dve nalaganji* v [delitvi razlike](difference.md). Nalaganje ene datoteke ga ne dobi - konstantni stolpec bi stal 4 bajte na vrstico, da bi nekaj povedal.
- **Manjkajoči stolpci.** Datoteka, ki nima enega od stolpcev *filtra*, preprosto ne prispeva vrednosti zanj. Datoteka, ki nima preslikanega stolpca *vloge* (X, čas, oseba ...), odpove z *datoteka nima stolpca „ime”*; pri nalaganju več datotek se ta datoteka preskoči, ostale se naložijo, preskočene datoteke pa so navedene na naboru podatkov. Nalaganje ene datoteke, ki odpove, prijavi napako.
- **Opozorilo o primanjkljaju.** Kadar je naloženih vrstic manj kot 95 % vrstic, preštetih vnaprej, nabor podatkov nosi opozorilo z deležem manjkajočih - zaradi nečitljivih datotek ali vrstic brez uporabnega položaja, ki se na poti vanj zavržejo.

## Po nalaganju {#after-loading}

Nov nabor podatkov nadomesti prejšnjega. Ob vsakem nalaganju ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- vsi filtri in vidnost skupin se počistijo;
- delitev razlike po skupinah se ponastavi: prva polovica skupin (zaokrožena navzgor) pozitivna, ostale negativne;
- polmer pik se nastavi na vodoravni obseg / 120, nasičenost na analitično oceno; velikost kock, dolžina žarka pogleda, hitrost letenja in bližnja/daljna ravnina se nastavijo glede na obseg (glejte [Seje, osebe in skupine](sessions-persons-groups.md#entity-size));
- seja zavihka škatlastega predvajanja se nastavi na sejo z največ vrsticami;
- poti toplote črte se znova ugibajo ([Toplota črt](line-heat.md));
- način pogleda se vrne na **Toplota**, če novi podatki trenutnega načina ne podpirajo; časovnica se vrne na **Vse** brez stolpca časa, zgodovina pa na **Kumulativno** brez življenjskih dob;
- glava predvajanja se postavi na začetek in predvajanje se ustavi;
- kamera uokviri celoten nabor podatkov iz privzete smeri (gleda vzdolž -Z, nagnjena navzdol za približno 36°).

Plošča **Nabor podatkov** nato prikaže ime nabora (izbiro, števila vrstic in datotek ter korak, če je bil uporabljen), `N ekip · N oseb · N s obseg`, in vsa opozorila, ki jih je nalaganje ustvarilo, v jantarni barvi, dokler je nabor naložen. **Odstrani** na tej plošči odstrani nabor podatkov.
