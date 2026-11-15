---
title: "Boravak u memoriji GPU-a"
parent: "Unutarnji dijelovi iscrtavanja"
nav_order: 5
lang: "hr"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Boravak u memoriji GPU-a

Grafička kartica ima samo određenu količinu memorije. Ako vaši podaci ne stanu, preglednik prikazuje što stane i kaže to: prikaz statistike dobija jantarni redak **Nije u memoriji** s brojem redaka koji su izostavljeni. Skraćeni skup podataka koji izgleda cjelovit bila bi najgora greška koju alat za analizu može napraviti, pa se ovaj redak nikad ne skriva.

![Prikaz statistike s jantarnim retkom Nije u memoriji](../assets/img/en/gpu-memory-not-resident.webp)

Da stane više, povisite GPU proračun pod **Proračun resursa** i ponovno učitajte ([Memorija i proračuni](memory-and-budgets.md#raising-the-gpu-budget)), prvo suzite podatke ili koristi karticu s više memorije.

## Za razvojne programere {#for-developers}

### Kako se retci pohranjuju na GPU-u {#how-rows-are-stored-on-the-gpu}

Retci se učitavaju jednom, kad stigne skup podataka, u **dijelovima** od 8.388.608 redaka (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Svaki dio se kvantizira prema vlastitom graničnom okviru i vremenskom rasponu:

| Podatak | Format | Bajtova po retku |
|---|---|---|
| Položaj X, Y, Z i id grupe | četiri 16-bitna neoznačena cijela broja (RGBA16UI na WebGL2-u); X, Y, Z unutar graničnog okvira dijela | 8 |
| Vrijeme i trajanje (kad skup podataka ima i vrijeme i osobu) | dva 16-bitna neoznačena cijela broja (RG16UI): vrijeme unutar vremenskog raspona dijela; trajanje, pri čemu 65.535 znači "nema sljedećeg uzorka" | 4 |

Granični okviri po dijelu su ono što čini 16 bita dovoljnima: dio obično pokriva dio karte, pa je korak kvantizacije daleko ispod centimetra na karti širokoj kilometrima, daleko ispod šuma u pravoj telemetriji. Id grupe u četvrtom kanalu je besplatan - i zato može biti najviše 4.096 grupa ([Sesije, osobe i grupe](sessions-persons-groups.md#limits)).

Na WebGL2-u je svaki dio tekstura široka 8.192 texela, popunjena do cijelih redaka teksture; do redaka se dolazi iz `gl_VertexID` kroz teksturu indeksa blokova po kadru. Na WebGPU-u su to storage bufferi.

Dodatna memorija GPU-a po retku, dodijeljena pri upotrebi:

- svaki aktivni [filtar](filters.md) stupca: 4 bajta po retku (32-bitne decimalne vrijednosti ili id-ovi kategorija), učitani po dijelu prvi put kad se filtar koristi;
- [linijska toplina](line-heat.md): 8 bajtova po retku (početak svakog segmenta, kvantiziran unutar graničnog okvira podataka, i njegove zastavice) dok je način Linije uključen.

Uz to ciljevi iscrtavanja: boja i dubina scene, cilj topline i njegov pomoćni dvojnik (četiri kanala u [Toplina timova](team-heat.md)), i slojevi depth-peelinga za [zaklon](depth-and-culling.md); te geometrija razine.

### Proračun se provodi pri učitavanju {#the-budget-is-enforced-at-upload}

WebGL prihvaća dodjele koje ne može poslužiti, pa ili izgubi kontekst ili pada na sistemsku memoriju uz pogubne troškove, pa se GPU proračun provodi kad se skup podataka učitava ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- dijelovi se učitavaju redom (dakle vremenskim redom) dok stanu;
- prvi dio koji ne stane učitava se **djelomično** - onoliko cijelih redaka teksture koliko preostali proračun drži - umjesto da se uopće ne učita, pa proračun koji ne može držati cijeli dio i dalje prikazuje što može; a budući da su retci poredani po vremenu, prikazani dio je povezan vremenski niz;
- sve poslije je **nije u memoriji**.

Manjak se ne skriva: prikaz statistike pokazuje redak **Nije u memoriji** s brojem redaka koji nisu stali, jantarnom bojom, kad god je veći od nule. Skraćeni skup podataka koji izgleda cjelovit najgora je greška koju alat za analizu može imati. [Provjera stanja](memory-and-budgets.md#the-fit-check) prije učitavanja služi da spriječi ovaj slučaj.

Proračun koji iscrtavač koristi je GPU proračun iz **Proračun resursa**, ista brojka koju koristi provjera stanja - i iznad otkrivene brojke, do gornje granice klizača (vidi [Povisivanje GPU proračuna](memory-and-budgets.md#raising-the-gpu-budget)). Primjenjuje se kad se skup podataka učitava; promjena nakon toga stupa na snagu pri sljedećem učitavanju.
