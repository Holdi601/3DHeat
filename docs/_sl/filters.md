---
title: "Filtri"
parent: "Filtri in orodja"
nav_order: 1
lang: "sl"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filtri

**Filtri** skrijejo vrstice, ki vas ne zanimajo, na primer en razred vozil ali eno vrsto dogodka, slika pa se takoj posodobi. Plošča našteje stolpce, ohranjene ob nalaganju pod *Ohrani za filtriranje* ([Preslikava stolpcev](column-mapping.md)), in *Izvorna datoteka*, kadar je naloženih več datotek.

## Preizkusite {#try-it}

1. Naložite nabor podatkov in v stranski vrstici odprite **Filtri**.
2. Pod **Razred vozila** odkljukajte *Tank*. Slika se takoj spremeni.
3. Pritisnite **Počisti vse filtre**, da razveljavite.

![Plošča Filtri: najprej lastni stolpci pregledovalnika (Vrsta dogodka, Razred vozila), nato stolpci iz vaše datoteke](../assets/img/en/filters.webp)

Prve vrstice so lastni stolpci pregledovalnika (spodaj). Vrstice za njimi prihajajo iz vaše datoteke.

## Stolpci, ki jih doda pregledovalnik {#columns-the-viewer-adds}

Ob nalaganju pregledovalnik sam ugotovi štiri stolpce in jih našteje **najprej**, z imeni in vrednostmi v vašem jeziku, zato isti filter deluje za vsako igro in vir podatkov:

| Stolpec | Vrednosti | Izračunano iz |
|---|---|---|
| **Vrsta dogodka** | 23 vrst: Položaj, Izstreljen strel, Izstrelitev (raketa, raketa, bomba), Zadetek, Zgrešitev (orožje se je končalo blizu nobene tarče), Eksplozija, Poškodba, Kill, Smrt, Uničen, Strmoglavitev, Katapultiranje / skok, Pojavitev, Izginotje, Vzlet, Pristanek, Stik s tlemi, Ustavitev na tleh, Ponovno oboroževanje / gorivo, Zajem / cilj, Vaba, Sporočilo, Drugo | stolpec `event`, `events`, `event_type` ali `event_name`; besede vsake igre (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) so preslikane v te vrste. Celotna tabela: [Vrste in razredi dogodkov](ref-event-types.md). |
| **Igralec ali UI** | Igralec, UI | stolpec `ai`, `is_ai`, `bot` ali `actor`; sicer `is_player` / `human`; sicer ID računa (`user_id`, `steam_id`; prazno ali 0 je UI); pri posnetkih Tacview, ali ima objekt pilota |
| **Razred vozila** | 17 razredov: Lovec, Napadalno letalo, Bombnik, Drugo letalo, Helikopter, Tank, Oklepno vozilo, Protiletalska obramba, Artilerija, Tovornjak / avto, Ladja, Podmornica, Pehota, Orožje, Vaba, Objekt, Drugo | ime vozila ali enote (ujemanje s [katalogom figur](figures.md)) in stolpci tipa |
| **Razred cilja** | isti razredi | vozilo nasprotne strani (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Naštete so le vrste, ki se pojavijo. Stolpci vrednosti (`cost_*`, `earn_*`, `net_*` in *Vir cene*, glejte [Utežitev vrednosti](value-weighting.md)) se filtrirajo kot vsak številski stolpec: na primer odkljukajte *ocena* pod *Vir cene*, da ohranite le ovrednotene vrstice.

Seznam kategorij z več kot 12 vrednostmi dobi iskalno polje (*Išči n vrednosti*) in gumb **Samo ti**, ki dovoli natanko ujemajoče vrednosti.

Kateri stolpci se lahko filtrirajo, se odloči ob nalaganju, ker jih je treba takrat prebrati. Brez ohranjenega stolpca plošča to pove in napoti na *Ohrani za filtriranje*.

## Številski stolpci (razpon) {#numeric-columns-range}

![Filter razpona (izgubljen denar) z obema krajema povlečenima](../assets/img/en/filters-numeric.webp)

| Del | Pomen |
|---|---|
| Ime in `min ... max` | Stolpec in trenutni razpon (celoten razpon stolpca, dokler filter ni nastavljen). |
| Prva vrstica: polje za število in drsnik | Spodnja meja. Če drsnik povlečete nad zgornjo mejo, ta gre z njim. |
| Druga vrstica: polje za število in drsnik | Zgornja meja. Če povlečete pod spodnjo, tudi ta gre z njo. |
| **Ponastavi *stolpec***  | Odstrani ta filter. |

Drsniki pokrivajo najmanjšo do največjo vrednost stolpca v 1.000 korakih; polja za števila sprejmejo katerokoli vrednost. Vrstica prestane, kadar je njena vrednost znotraj razpona, z obema robovoma vključenima. Velike vrednosti so prikazane v eksponentni obliki (`1,23e6`).

## Stolpci kategorij {#category-columns}

| Del | Pomen |
|---|---|
| Ime in `dovoljeno/skupaj` | Stolpec in koliko njegovih vrednosti je dovoljenih. |
| Seznam vrednosti | Potrditveno polje za vsako vrednost; prazna vrednost je prikazana kot *(prazno)*. |
| **Vse** / **Nič** | Dovoli vsako vrednost / nobene vrednosti. |

Dovoljenje vsake vrednosti odstrani filter.

## Pravila {#rules}

- **Štirje filtri hkrati.** Glava kaže `aktivno/4`. Peti filter se ne uporabi, plošča pa to pove. Izbira v [Entitetah](entities.md) (ali fokus igralca v zavihku Tekma) uporabi enega od štirih. Filter, ki pokriva celoten stolpec, ne porabi nobenega.
- **Stolpec kategorij ima največ 4.096 vrednosti**; širši ob nalaganju ni ohranjen.
- **Filtri se združujejo z IN** ter z vidnostjo ekip, delitvijo razlike, časovnim oknom, izrezovanjem razdalje in [rezom](slice.md).
- **Sprememba filtra ponovno zažene kopičenje in nekaj okvirjev kasneje ponovno izmeri osvetlitev**, ker lahko filtriranje močno spremeni gostoto ([Barva in osvetlitev](colour-and-exposure.md#auto-exposure)).
- **Počisti vse filtre** odstrani vse filtre stolpcev. Vidnost ekip in izbire igralcev, nastavljene drugje, ostanejo.
- Filtri stolpcev spremenijo načine toplote. Ne spremenijo figur [predvajanja figur](box-replay.md), ki sledijo vidnosti ekip in izbiri v Entitetah. Izbira v Entitetah spremeni oboje.
- V [črtni toploti](line-heat.md) se filter preizkusi na vrstici, na kateri se vsak odsek *konča*.
- Ob vsakem novem naboru podatkov so vsi filtri počiščeni.

## For developers {#for-developers}

**Slots.** Each active filter takes one of four GPU slots ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), a texture of 4 bytes per row. Slots go to the filters in the order they were last changed ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), shared by the shader and both panels). Past four, an error says *Only the first 4 filters are applied. Clear one - the rest are being ignored, not silently combined*, and the extra filters' names read *column (not applied)*. Filters run per row in the vertex shader, so changing a threshold needs no re-parse and no re-upload.

**Filters the panel does not show.** Two more kinds exist in the application state ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- a **groups** filter, set by the Match tab when it focuses one side. It hides the other groups in every mode, a [difference](difference.md) split by a column included.
- a **persons** filter, set by the [Entities](entities.md) panel and by the Match tab when it focuses one player. It restricts the figure replay and the heat modes. In the heat it is a category filter over the person ids and takes one of the four slots. Its mask holds 65,536 ids ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); a person past that is not drawn in the heat while it is active, even when selected. The figure replay still shows them.
