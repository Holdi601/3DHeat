---
title: "Toplina"
parent: "Načini topline"
nav_order: 1
lang: "hr"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Toplina

Toplina boji mjesta gdje se događalo mnogo stvari: crveno tamo gdje se događalo malo, bijelo-vruće tamo gdje se događalo puno. Odgovara na pitanje „gdje se ovo događa i koliko?”.

**Toplina** (tipka 1) je zadani način. Svaki vidljivi [redak](glossary.md) doprinosi okruglim [spriteom](glossary.md) okrenutim prema kameri; preklapajući spriteovi zbrajaju se u međuspremnik s pomičnom točkom; zbroj se preslikava kroz skalu boja - zadano prozirno → crveno → žuto → bijelo - i crta preko scene.

![Toplina na 3D razini: vruće točke unutar i na vrhu zgrada](../assets/img/en/shooter-heat.webp)

Slika prikazuje toplinu runde strijelca na razini sa zgradama: vruće točke su u sobama i na stubištima, ne samo na tlu.

## Kako se koristi {#how-to-use-it}

1. Učitajte podatke i pritisnite `1` (ili odaberite **Toplina** na traci načina).
2. Ako je sve bijelo ili prazno, pritisnite **Automatska ekspozicija iz polja** u odjeljku **Oblik topline**.
3. Mijenjajte **Radijus spritea** dok se susjedne točke ne spoje u pojaseve: manji prikazuje pojedinačne mrlje, veći prikazuje područja.
4. Otvorite **Boje topline** da promijenite boje, ili **Dubinu** da brda i zidovi sakriju toplinu iza sebe.

![Odjeljci Oblik topline i Boje topline na bočnoj traci, oba otvorena](../assets/img/en/heat-panel.webp)

Isti paneli oblikuju [Razliku](difference.md), [Toplinu timova](team-heat.md) i [Linijsku toplinu](line-heat.md); razlikuju se po onome što se dodaje (s predznakom, obojeno ili duž linija), a ne po načinu.

## Paneli i njihove zadane vrijednosti {#the-panels-and-their-defaults}

Svaka kontrola u nastavku preslikava se na parametar shadera, pa njezina promjena ne košta ništa osim ponovnog crtanja. Klizači imaju polje za upisivanje s desne strane i ručicu za povlačenje (mali hvatač s desne strane: povucite gore ili dolje, dalje je brže, Shift za fino podešavanje); gdje kolosijek klizača završi prije stvarne granice, ručica može gurnuti dalje do *gornje granice pomicanja* navedene ovdje. Vrijednosti označene *pri učitavanju* ponovno se izračunavaju za svaki novi skup podataka.

### Oblik topline (otvoreno) {#heat-shape-open}

| Kontrola | Zadano | Raspon (gornja granica pomicanja) | Pojedinosti |
|---|---|---|---|
| **Radijus spritea** | 6 m; pri učitavanju opseg / 120 | 0,05-2000 m, logaritamski (50.000) | [Oblik spritea](sprite-shape.md#sprite-radius) |
| **Intenzitet u središtu** | 1 | 0-10 (1000) | [Oblik spritea](sprite-shape.md#centre-and-edge-intensity) |
| **Intenzitet na rubu** | 0 | -2-10 (1000) | [Oblik spritea](sprite-shape.md#centre-and-edge-intensity) |
| **Oblik skale** | *Opadanje* | *Opadanje* / *Krivulja* | [Oblik spritea](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Opadanje** (samo za Opadanje) | 1,6 | 0,1-8 (64) | [Oblik spritea](sprite-shape.md#falloff) |
| **Glatka skala** (samo za Opadanje) | uključeno | | [Oblik spritea](sprite-shape.md#falloff) |
| Uređivač krivulje (samo za Krivulju) | predložak *Glatko* | | [Oblik spritea](sprite-shape.md#the-curve-editor) |
| **Točka zasićenja** | 24; pri učitavanju procjena, zatim mjerenje | 0,1-4000, logaritamski (10.000.000) | [Boja i ekspozicija](colour-and-exposure.md#saturation-point) |
| **Minimalna toplina** | isključeno (0) | 0-100% | [Boja i ekspozicija](colour-and-exposure.md#minimum-heat) |
| **Odziv gustoće** | *Zasićujući* | *Zasićujući* / *Linearni* / *Logaritamski* | [Boja i ekspozicija](colour-and-exposure.md#density-response) |
| **Automatska ekspozicija iz polja** | | gumb | [Boja i ekspozicija](colour-and-exposure.md#auto-exposure) |
| **Prati prikaz** | uključeno | | Ponovno mjeri ekspoziciju svaki put kad kamera stane, pa se regija u koju uletite koristi cijelu skalu boja. Male promjene se zanemaruju, a mjerilo klizi glatko. Isključite to, ili povucite **Točku zasićenja**, da zaključate mjerilo i usporedite mjesta na jednom mjerilu. [Boja i ekspozicija](colour-and-exposure.md#follow-the-view) |
| **Ista gustoća pri svakom zumiranju** | uključeno | | Boja znači isti broj redaka po površini tla koliko god ste blizu. Sprite koji ograničenja piksela povećavaju (izdaleka) ili smanjuju (izbliza) zadržava toplinu koju bi dodao njegov stvarni oblik, pa se slika eksponirana izdaleka ne gubi dok letite u nju. Isključeno, ograničeni sprite dodaje punu težinu pri svojoj ograničenoj veličini. [Oblik spritea](sprite-shape.md#pixel-clamps) |
| **Spljošti na ravninu tla** | isključeno | | [Oblik spritea](sprite-shape.md#flatten-onto-ground-plane) |

### Boje topline (zatvoreno) {#heat-colours-closed}

| Kontrola | Zadano | Pojedinosti |
|---|---|---|
| Uzorci grupa i **Razdvajanje boja** (samo Toplina timova) | 1,4 | [Toplina timova](team-heat.md) |
| Uređivač **Toplinske skale** (*Pozitivna (timovi koji dodaju)* u Razlici, *Skala neprozirnosti* u Toplini timova) | prozirno → crveno → žuto → bijelo | [Boja i ekspozicija](colour-and-exposure.md#the-ramp-editor) |
| **Vrati na prozirno → crveno → žuto → bijelo** | | |
| Skala **Negativna (timovi koji oduzimaju)** (samo Razlika) | prozirno → zeleno → plavo → ljubičasto | [Razlika](difference.md#colours) |

### Ograničenja piksela sprite-a (zatvoreno) {#sprite-pixel-clamps-closed}

| Kontrola | Zadano | Raspon (gornja granica pomicanja) | Pojedinosti |
|---|---|---|---|
| **Najmanji radijus u pikselima** | 1 px | 0-16 (512) | [Oblik spritea](sprite-shape.md#pixel-clamps) |
| **Najveći radijus u pikselima** | 96 px | 2-1024, logaritamski (8192) | [Oblik spritea](sprite-shape.md#pixel-clamps) |

### Dubina (otvoreno) {#depth-open}

| Kontrola | Zadano | Pojedinosti |
|---|---|---|
| **Sakrij iza terena** | uključeno | [Dubina i odbacivanje](depth-and-culling.md#hide-behind-terrain) |
| **Skriveno iza geometrije** | 0,8 (*80% tamnije*) | [Dubina i odbacivanje](depth-and-culling.md#hidden-behind-geometry) |

### Odbacivanje po udaljenosti (zatvoreno) {#distance-culling-closed}

| Kontrola | Zadano | Raspon (gornja granica pomicanja) | Pojedinosti |
|---|---|---|---|
| **Blizu** | isključeno (0) | 0,5-5000 m, logaritamski, dno kolosijeka = isključeno (200.000) | [Dubina i odbacivanje](depth-and-culling.md#distance-culling) |
| **Daleko** | isključeno (0) | 1-200.000 m, logaritamski, dno = isključeno (10.000.000) | [Dubina i odbacivanje](depth-and-culling.md#distance-culling) |
| **Reži ravninom** | uključeno | | [Dubina i odbacivanje](depth-and-culling.md#distance-culling) |
| **Reži i razinu** | uključeno | | [Dubina i odbacivanje](depth-and-culling.md#distance-culling) |

Tipke: `[` i `]` guraju daleku granicu unutra i van, `\` je uključuje i isključuje ([Dubina i odbacivanje](depth-and-culling.md#keyboard)).

### Smjer i vrijednost {#direction-and-value}

Još dva odjeljka nalaze se ispod Oblika topline. **Smjer** crta svaki redak kao klin i dodaje strelice: vidi [Usmjerena toplina](directional-heat.md). **Vrijednost** pondera toplinu prema onome što je svaki redak koštao ili donio: vidi [Ponderiranje vrijednosti](value-weighting.md).

## Što se sprema {#what-is-saved}

Gore navedene postavke topline se ne pamte između sesija: ponovno učitavanje stranice vraća zadane vrijednosti. Dvije stvari se čuvaju u pregledniku: posljednja brzina reprodukcije (`heat3d.speed`, vidi [Vremenska traka](timeline.md)) i postavke udaljenih figura [prekrivanja figura](box-replay.md) (stil simbola, veličina, oznake pogodaka i tako dalje). Tako je i s jezikom, [obrnutim svjetskim osima](camera.md#invert-world-axis), zapamćenim imenima automobila na kartici utrke i [bibliotekom razina](level-library.md). Potpuni popis je na [Spremljene postavke](ref-settings-storage.md).
