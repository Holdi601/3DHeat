---
title: "Filteri"
parent: "Filteri i alati"
nav_order: 1
lang: "bs"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filteri

**Filteri** sakrivaju redove koji vas ne zanimaju, kao što je jedna klasa vozila ili jedna vrsta događaja, a slika se odmah ažurira. Panel navodi kolone zadržane pri učitavanju pod *Zadrži za filtriranje* ([Mapiranje kolona](column-mapping.md)), plus *Izvorna datoteka* kada je učitano nekoliko datoteka.

## Isprobajte {#try-it}

1. Učitajte skup podataka i otvorite **Filteri** u bočnoj traci.
2. Pod **Klasa vozila** odštiklirajte *Tenk*. Slika se odmah mijenja.
3. Pritisnite **Očisti sve filtere** da poništite.

![Panel Filteri: prvo sopstvene kolone prikazivača (Vrsta događaja, Klasa vozila), zatim kolone iz vaše datoteke](../assets/img/en/filters.webp)

Prvi redovi su sopstvene kolone prikazivača (ispod). Redovi nakon njih dolaze iz vaše datoteke.

## Kolone koje prikazivač dodaje {#columns-the-viewer-adds}

Pri učitavanju prikazivač sam izvodi četiri sopstvene kolone i navodi ih **prve**, s nazivima i vrijednostima na vašem jeziku, pa isti filter radi za svaku igru i svaki izvor podataka:

| Kolona | Vrijednosti | Izvedeno iz |
|---|---|---|
| **Vrsta događaja** | 23 vrste: Pozicija, Ispaljen hitac, Lansiranje (raketa, projektil, bomba), Pogodak, Promašaj (oružje završilo blizu mete), Eksplozija, Oštećenje, Ubistvo, Smrt, Uništeno, Pad, Katapultiranje / izbacivanje, Pojavljivanje, Nestajanje, Polijetanje, Slijetanje, Kontakt s tlom, Zaustavljanje na tlu, Ponovno punjenje / gorivo, Hvatanje / cilj, Mamac, Poruka, Ostalo | kolona zvana `event`, `events`, `event_type` ili `event_name`; riječi svake igre (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) mapiraju se na ove vrste. Potpuna tabela: [Vrste i klase događaja](ref-event-types.md). |
| **Igrač ili AI** | Igrač, AI | kolona `ai`, `is_ai`, `bot` ili `actor`; inače `is_player` / `human`; inače id naloga (`user_id`, `steam_id`; prazno ili 0 je AI); za Tacview snimke, da li objekat ima pilota |
| **Klasa vozila** | 17 klasa: Lovac, Jurišni avion, Bombarder, Ostali avioni, Helikopter, Tenk, Oklopno vozilo, Protivvazdušna odbrana, Artiljerija, Kamion / auto, Brod, Podmornica, Pješadija, Oružje, Mamac, Građevina, Ostalo | naziv vozila ili jedinice (upoređen s [katalogom figura](figures.md)) i kolone tipa |
| **Klasa cilja** | iste klase | vozilo druge strane (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Navode se samo vrste koje se pojavljuju. Kolone vrijednosti (`cost_*`, `earn_*`, `net_*` i *Izvor troška*, vidi [Ponderisanje vrijednosti](value-weighting.md)) mogu se filtrirati kao svaka numerička kolona: na primjer, odštiklirajte *procjena* pod *Izvor troška* da zadržite samo redove s cijenom.

Lista kategorija s više od 12 vrijednosti dobija polje za pretragu (*Pretraži n vrijednosti*) i dugme **Samo ovi** koje dozvoljava tačno one vrijednosti koje odgovaraju.

Koje kolone se mogu filtrirati odlučuje se pri učitavanju, jer se tada moraju pročitati. Bez ijedne zadržane kolone panel to kaže i upućuje na *Zadrži za filtriranje*.

## Numeričke kolone (opseg) {#numeric-columns-range}

![Filter opsega (izgubljeni novac) s oba kraja povučena](../assets/img/en/filters-numeric.webp)

| Dio | Značenje |
|---|---|
| Naziv i `min ... max` | Kolona i trenutni opseg (cijeli opseg kolone dok filter nije postavljen). |
| Prvi red: polje za broj i klizač | Donja granica. Prevlačenje klizača iznad gornje granice gura i gornju granicu. |
| Drugi red: polje za broj i klizač | Gornja granica. Prevlačenje ispod donje granice gura i nju. |
| **Vrati *kolonu***  | Uklanja ovaj filter. |

Klizači pokrivaju minimum do maksimum kolone u 1.000 koraka; polja za broj prihvataju bilo koju vrijednost. Red prolazi kada je njegova vrijednost unutar opsega, uključujući oba kraja. Velike vrijednosti se prikazuju u eksponencijalnom obliku (`1.23e6`).

## Kategorijske kolone {#category-columns}

| Dio | Značenje |
|---|---|
| Naziv i `dozvoljeno/ukupno` | Kolona i koliko njenih vrijednosti je dozvoljeno. |
| Spisak vrijednosti | Polje za štikliranje po vrijednosti; prazna vrijednost prikazuje se kao *(prazno)*. |
| **Sve** / **Ništa** | Dozvoli svaku vrijednost / nijednu vrijednost. |

Dozvoljavanje svih vrijednosti uklanja filter.

## Pravila {#rules}

- **Četiri filtera odjednom.** Zaglavlje prikazuje `aktivni/4`. Peti filter se ne primjenjuje, a panel to kaže. Izbor u [Entitetima](entities.md) (ili fokus igrača na kartici Meč) takođe koristi jedno od četiri mjesta. Filter koji obuhvata cijelu kolonu ne koristi nijedno.
- **Kategorijska kolona ima najviše 4.096 vrijednosti**; šira se ne zadržava pri učitavanju.
- **Filteri se kombinuju kao I**, i sa vidljivošću timova, podjelom razlike, vremenskim prozorom, culling-om po udaljenosti i [presjekom](slice.md).
- **Promjena filtera ponovo pokreće akumulaciju i ponovo mjeri ekspoziciju** nekoliko frejmova kasnije, jer filtriranje može jako promijeniti gustinu ([Boja i ekspozicija](colour-and-exposure.md#auto-exposure)).
- **Očisti sve filtere** uklanja svaki filter kolone. Vidljivost timova i izbori igrača postavljeni drugdje se zadržavaju.
- Filteri kolona mijenjaju načine toplote. Ne mijenjaju figure [reprodukcije figura](box-replay.md), koje prate vidljivost timova i izbor u Entitetima. Izbor u Entitetima mijenja oboje.
- U [toploti linija](line-heat.md) filter se provjerava na redu u kojem se svaki segment *završava*.
- Pri svakom novom skupu podataka svi filteri se brišu.

## Za programere {#for-developers}

**Slots.** Each active filter takes one of four GPU slots ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), a texture of 4 bytes per row. Slots go to the filters in the order they were last changed ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), shared by the shader and both panels). Past four, an error says *Only the first 4 filters are applied. Clear one - the rest are being ignored, not silently combined*, and the extra filters' names read *column (not applied)*. Filters run per row in the vertex shader, so changing a threshold needs no re-parse and no re-upload.

**Filters the panel does not show.** Two more kinds exist in the application state ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- a **groups** filter, set by the Match tab when it focuses one side. It hides the other groups in every mode, a [difference](difference.md) split by a column included.
- a **persons** filter, set by the [Entities](entities.md) panel and by the Match tab when it focuses one player. It restricts the figure replay and the heat modes. In the heat it is a category filter over the person ids and takes one of the four slots. Its mask holds 65,536 ids ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); a person past that is not drawn in the heat while it is active, even when selected. The figure replay still shows them.
