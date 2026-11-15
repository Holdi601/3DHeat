---
title: "Filtri"
parent: "Filtri i alati"
nav_order: 1
lang: "hr"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filtri

**Filtri** skrivaju redke koji vas ne zanimaju, poput jedne klase vozila ili jedne vrste događaja, a slika se odmah ažurira. Panel navodi stupce zadržane pri učitavanju pod *Zadrži za filtriranje* ([Mapiranje stupaca](column-mapping.md)), plus *Izvorna datoteka* kad je učitano više datoteka.

## Isprobajte {#try-it}

1. Učitajte skup podataka i otvorite **Filtri** u bočnoj traci.
2. Pod **Klasa vozila** odznačite *Tank*. Slika se odmah mijenja.
3. Pritisnite **Očisti sve filtre** za poništavanje.

![Panel Filtri: prvo vlastiti stupci preglednika (Vrsta događaja, Klasa vozila), zatim stupci iz vaše datoteke](../assets/img/en/filters.webp)

Prvi redci su vlastiti stupci preglednika (u nastavku). Redci nakon njih dolaze iz vaše datoteke.

## Stupci koje preglednik dodaje {#columns-the-viewer-adds}

Pri učitavanju preglednik sam izrađuje četiri stupca i navodi ih **prvo**, s imenima i vrijednostima na vašem jeziku, pa isti filtar radi za svaku igru i izvor podataka:

| Stupac | Vrijednosti | Izvodi se iz |
|---|---|---|
| **Vrsta događaja** | 23 vrste: Pozicija, Ispaljen hitac, Lansiranje (projektil, raketa, bomba), Pogodak, Promašaj (oružje završilo blizu nijedne mete), Eksplozija, Oštećenje, Ubojstvo, Smrt, Uništeno, Pad, Katapultiranje / iskakanje, Pojava, Nestanak, Polijetanje, Slijetanje, Dodir s tlom, Zaustavljanje na tlu, Ponovno naoružavanje / punjenje, Zauzimanje / cilj, Mamac, Poruka, Ostalo | stupac pod nazivom `event`, `events`, `event_type` ili `event_name`; riječi svake igre (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) preslikavaju se u ove vrste. Potpuna tablica: [Vrste i klase događaja](ref-event-types.md). |
| **Igrač ili UI** | Igrač, UI | stupac `ai`, `is_ai`, `bot` ili `actor`; inače `is_player` / `human`; inače id računa (`user_id`, `steam_id`; prazno ili 0 je UI); za Tacview snimke, ima li objekt pilota |
| **Klasa vozila** | 17 klasa: Lovac, Jurišni zrakoplov, Bombarder, Ostali zrakoplovi, Helikopter, Tenk, Oklopno vozilo, Protuzračna obrana, Topništvo, Kamion / auto, Brod, Podmornica, Pješaštvo, Oružje, Mamac, Građevina, Ostalo | ime vozila ili jedinice (uspoređeno s [katalogom figura](figures.md)) i stupci tipa |
| **Klasa cilja** | iste klase | vozilo druge strane (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Navode se samo vrste koje se pojavljuju. Stupci vrijednosti (`cost_*`, `earn_*`, `net_*` i *Izvor cijene*, vidi [Ponderiranje vrijednosti](value-weighting.md)) filtriraju se kao i svaki brojčani stupac: na primjer, odznačite *estimate* pod *Izvor cijene* da zadržite samo redke s cijenom.

Popis kategorija s više od 12 vrijednosti dobiva polje za pretragu (*Pretraži n vrijednosti*) i gumb **Samo ovi** koji dopušta točno one vrijednosti koje odgovaraju.

Koji se stupci mogu filtrirati odlučuje se pri učitavanju, jer se tada moraju čitati. Bez i jednog zadržanog stupca panel to kaže i upućuje na *Zadrži za filtriranje*.

## Brojčani stupci (raspon) {#numeric-columns-range}

![Filtar raspona (izgubljeni novac) s oba kraja povučena](../assets/img/en/filters-numeric.webp)

| Dio | Značenje |
|---|---|
| Ime, i `min ... max` | Stupac i trenutni raspon (puni raspon stupca dok nije postavljen filtar). |
| Prvi redak: polje za broj i klizač | Donja granica. Povlačenje klizača iznad gornje granice gura i gornju granicu s njim. |
| Drugi redak: polje za broj i klizač | Gornja granica. Povlačenje ispod donje granice gura i nju. |
| **Vrati *stupac*** | Uklanja ovaj filtar. |

Klizači pokrivaju najmanju do najveću vrijednost stupca u 1000 koraka; polja za broj prihvaćaju bilo koju vrijednost. Redak prolazi kad mu je vrijednost unutar raspona, uključujući oba kraja. Velike vrijednosti prikazuju se u eksponencijalnom obliku (`1.23e6`).

## Stupci kategorija {#category-columns}

| Dio | Značenje |
|---|---|
| Ime, i `dopušteno/ukupno` | Stupac i koliko je njegovih vrijednosti dopušteno. |
| Popis vrijednosti | Potvrdni okvir po vrijednosti; prazna vrijednost prikazuje se kao *(prazno)*. |
| **Sve** / **Ništa** | Dopusti svaku vrijednost / nijednu vrijednost. |

Dopuštanje svake vrijednosti uklanja filtar.

## Pravila {#rules}

- **Četiri filtra istovremeno.** Zaglavlje prikazuje `aktivni/4`. Peti filtar se ne primjenjuje, a panel to kaže. Odabir u [Entitetima](entities.md) (ili fokus igrača na kartici Meč) koristi jedan od četiri. Filtar koji pokriva cijeli stupac ne koristi nijedan.
- **Stupac kategorije ima najviše 4096 vrijednosti**; širi se ne zadržava pri učitavanju.
- **Filtri se kombiniraju s I**, i s vidljivošću timova, podjelom razlike, vremenskim prozorom, odbacivanjem po udaljenosti i [presjekom](slice.md).
- **Promjena filtra ponovno pokreće akumulaciju i ponovno mjeri ekspoziciju** nekoliko okvira kasnije, jer filtriranje može jako promijeniti gustoću ([Boja i ekspozicija](colour-and-exposure.md#auto-exposure)).
- **Očisti sve filtre** uklanja svaki filtar stupca. Vidljivost timova i odabiri igrača postavljeni drugdje ostaju.
- Filtri stupaca mijenjaju načine topline. Ne mijenjaju figure [reprodukcije figura](box-replay.md), koje prate vidljivost timova i odabir u Entitetima. Odabir u Entitetima mijenja oboje.
- U [linijskoj toplini](line-heat.md) filtar se provjerava na retku u kojem svaki segment *završava*.
- Pri svakom novom skupu podataka svi filtri se brišu.

## For developers {#for-developers}

**Slots.** Each active filter takes one of four GPU slots ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), a texture of 4 bytes per row. Slots go to the filters in the order they were last changed ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), shared by the shader and both panels). Past four, an error says *Only the first 4 filters are applied. Clear one - the rest are being ignored, not silently combined*, and the extra filters' names read *column (not applied)*. Filters run per row in the vertex shader, so changing a threshold needs no re-parse and no re-upload.

**Filters the panel does not show.** Two more kinds exist in the application state ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- a **groups** filter, set by the Match tab when it focuses one side. It hides the other groups in every mode, a [difference](difference.md) split by a column included.
- a **persons** filter, set by the [Entities](entities.md) panel and by the Match tab when it focuses one player. It restricts the figure replay and the heat modes. In the heat it is a category filter over the person ids and takes one of the four slots. Its mask holds 65,536 ids ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); a person past that is not drawn in the heat while it is active, even when selected. The figure replay still shows them.
