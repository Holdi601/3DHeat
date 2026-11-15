---
title: "Ocuparea memoriei GPU"
parent: "Detalii interne ale randării"
nav_order: 5
lang: "ro"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Rezidența memoriei GPU

Placa grafică are doar o anumită cantitate de memorie. Dacă datele tale nu încap, vizualizatorul arată ce încape și spune asta: suprapunerea de statistici primește un rând chihlimbar **Nerezident** cu numărul de rânduri lăsate afară. O versiune scurtată a unui set de date care părea completă ar fi cea mai proastă greșeală pe care o poate face un instrument de analiză, deci acest rând nu este niciodată ascuns.

![Suprapunerea de statistici cu rândul chihlimbar Nerezident](../assets/img/en/gpu-memory-not-resident.webp)

Ca să încapă mai mult, mărește bugetul GPU din **Bugete de resurse** și încarcă din nou ([Memorie și bugete](memory-and-budgets.md#raising-the-gpu-budget)), îngustează mai întâi datele sau folosește o placă cu mai multă memorie.

## Pentru dezvoltatori {#for-developers}

### Cum sunt stocate rândurile pe GPU {#how-rows-are-stored-on-the-gpu}

Rândurile sunt încărcate o singură dată, când sosește un set de date, în **bucăți** de 8.388.608 rânduri (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Fiecare bucată este cuantizată în raport cu propria cutie de încadrare și cu propriul interval de timp:

| Date | Format | Octeți pe rând |
|---|---|---|
| Poziția X, Y, Z și id-ul grupului | patru întregi fără semn pe 16 biți (RGBA16UI pe WebGL2); X, Y, Z în cutia de încadrare a bucății | 8 |
| Timpul și durata de viață (când setul de date are și timp, și persoană) | doi întregi fără semn pe 16 biți (RG16UI): timpul în intervalul de timp al bucății; durata de viață, cu 65.535 însemnând „niciun eșantion următor" | 4 |

Cutiile de încadrare pe bucată sunt ce face ca 16 biți să ajungă: o bucată acoperă de obicei o fracțiune din hartă, deci pasul de cuantizare ajunge mult sub un centimetru pe o hartă de kilometri, mult sub zgomotul din telemetria reală. Id-ul grupului care stă în al patrulea canal nu costă nimic - și de aceea pot fi cel mult 4.096 de grupuri ([Grupuri](sessions-persons-groups.md#limits)).

Pe WebGL2 fiecare bucată este o textură lată de 8.192 de texeli, completată până la rânduri întregi de textură; rândurile sunt atinse din `gl_VertexID` printr-o textură cu indici de bloc, reîmprospătată la fiecare cadru. Pe WebGPU sunt buffere de stocare.

Alte memorii GPU pe rând, alocate la folosire:

- fiecare [filtru](filters.md) de coloană activ: 4 octeți pe rând (valori float pe 32 de biți sau id-uri de categorie), încărcat pe bucată prima dată când filtrul este folosit;
- [căldura pe linii](line-heat.md): 8 octeți pe rând (începutul fiecărui segment, cuantizat în cutia de încadrare a datelor, și indicatorii lui) cât timp modul Linii este pornit.

Plus țintele de randare: culoarea și adâncimea scenei, ținta căldurii și gemenul ei de lucru (patru canale în [Căldură pe echipe](team-heat.md)), straturile de peeling în adâncime pentru [ocluzie](depth-and-culling.md); și geometria nivelului.

### Bugetul se aplică la încărcare {#the-budget-is-enforced-at-upload}

WebGL acceptă alocări pe care nu le poate servi și apoi fie pierde contextul, fie trece pe memoria sistemului, cu un cost dezastruos; de aceea bugetul GPU se aplică când setul de date este încărcat ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- bucățile sunt încărcate în ordine (adică în ordinea timpului) cât timp încap;
- prima bucată care nu încape este încărcată **parțial** - atâtea rânduri de textură întregi cât încape în bugetul rămas - în loc de deloc, astfel încât un buget care nu poate ține o bucată întreagă arată cât poate; și pentru că rândurile sunt ordonate după timp, partea afișată este o porțiune coerentă de timp;
- tot ce urmează este **nerezident**.

Lipsa nu este ascunsă: suprapunerea de statistici arată un rând **Nerezident** cu numărul de rânduri care nu au încăput, chihlimbar, ori de câte ori este peste zero. Un set de date trunchiat care pare complet este cea mai gravă defecțiune pe care o poate avea un instrument de analiză. [Verificarea de încăpere](memory-and-budgets.md#the-fit-check) dinaintea încărcării este menită să prevină acest caz.

Bugetul pe care îl folosește randatorul este bugetul GPU din **Bugete de resurse**, aceeași cifră pe care o folosește verificarea de încăpere - peste cifra detectată, de asemenea, până la plafonul cursorului (vezi [Mărirea bugetului GPU](memory-and-budgets.md#raising-the-gpu-budget)). Se aplică la încărcarea unui set de date; schimbarea lui după aceea produce efect la următoarea încărcare.
