---
title: "Toplota"
parent: "Načini toplote"
nav_order: 1
lang: "bs"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Toplota

Toplota boji mjesta gdje se desilo mnogo stvari: crveno tamo gdje se desilo malo, skoro bijelo tamo gdje se desilo mnogo. Odgovara na pitanje „gdje se ovo dešava, i koliko“.

**Toplota** (tipka 1) je podrazumijevani način. Svaki vidljivi [red](glossary.md) doprinosi okruglim [sprajtom](glossary.md) okrenutim ka kameri; preklapajući sprajtovi se zbrajaju u bafer s pokretnim zarezom; zbir se preslikava kroz skalu boja - podrazumijevano prozirno → crveno → žuto → bijelo - i crta preko scene.

![Toplota na 3D nivou: vruće tačke unutar i na vrhu zgrada](../assets/img/en/shooter-heat.webp)

Slika prikazuje toplotu jednog kruga shootera na nivou sa zgradama: vruće tačke su u prostorijama i na stepenicama, ne samo na tlu.

## Kako se koristi {#how-to-use-it}

1. Učitajte podatke i pritisnite `1` (ili izaberite **Toplota** na traci načina).
2. Ako je sve bijelo ili prazno, pritisnite **Automatska ekspozicija iz polja** u odjeljku **Oblik toplote**.
3. Promijenite **Radijus sprajta** dok se susjedne tačke ne spoje u pojaseve: manji prikazuje pojedinačne tačke, veći prikazuje oblasti.
4. Otvorite **Boje toplote** da promijenite boje, ili **Dubinu** da brda i zidovi sakriju toplotu iza sebe.

![Odjeljci Oblik toplote i Boje toplote na bočnoj traci, oba otvorena](../assets/img/en/heat-panel.webp)

Isti paneli oblikuju [Razliku](difference.md), [Toplotu timova](team-heat.md) i [Toplotu linija](line-heat.md); razlikuju se po tome šta se dodaje (sa predznakom, obojeno ili duž linija), a ne po načinu na koji se to radi.

## Paneli i njihove podrazumijevane vrijednosti {#the-panels-and-their-defaults}

Svaka kontrola ispod odgovara parametru shadera, pa njena promjena ne košta ništa osim ponovnog crtanja. Klizači imaju polje za upis pored sebe i ručicu za prevlačenje (mali hvatač s desne strane: prevucite gore ili dolje, dalje je brže, Shift za fino podešavanje); gdje kraj staze klizača dolazi prije stvarne granice, ručica može ići preko nje do *gornje granice prevlačenja* navedene ovdje. Vrijednosti označene *pri učitavanju* ponovo se računaju za svaki novi skup podataka.

### Oblik toplote (otvoren) {#heat-shape-open}

| Kontrola | Podrazumijevano | Raspon (gornja granica prevlačenja) | Detalji |
|---|---|---|---|
| **Radijus sprajta** | 6 m; pri učitavanju opseg / 120 | 0,05-2000 m, logaritamski (50.000) | [Oblik sprajta](sprite-shape.md#sprite-radius) |
| **Intenzitet u centru** | 1 | 0-10 (1000) | [Oblik sprajta](sprite-shape.md#centre-and-edge-intensity) |
| **Intenzitet na rubu** | 0 | -2-10 (1000) | [Oblik sprajta](sprite-shape.md#centre-and-edge-intensity) |
| **Oblik prelaza** | *Opadanje* | *Opadanje* / *Kriva* | [Oblik sprajta](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Opadanje** (samo za Opadanje) | 1,6 | 0,1-8 (64) | [Oblik sprajta](sprite-shape.md#falloff) |
| **Gladak prelaz** (samo za Opadanje) | uključeno | | [Oblik sprajta](sprite-shape.md#falloff) |
| Uređivač krive (samo za Krivu) | predložak *Gladak* | | [Oblik sprajta](sprite-shape.md#the-curve-editor) |
| **Tačka zasićenja** | 24; pri učitavanju procjena, pa mjerenje | 0,1-4000, logaritamski (10.000.000) | [Boja i ekspozicija](colour-and-exposure.md#saturation-point) |
| **Najmanja toplota** | isključeno (0) | 0-100 % | [Boja i ekspozicija](colour-and-exposure.md#minimum-heat) |
| **Odziv na gustinu** | *Zasićenje* | *Zasićenje* / *Linearno* / *Log* | [Boja i ekspozicija](colour-and-exposure.md#density-response) |
| **Automatska ekspozicija iz polja** | | dugme | [Boja i ekspozicija](colour-and-exposure.md#auto-exposure) |
| **Prati prikaz** | uključeno | | Ponovo mjeri ekspoziciju svaki put kada kamera stane, pa područje u koje uletite koristi cijelu skalu boja. Male promjene se zanemaruju, a skala klizi. Isključite je, ili povucite **Tačku zasićenja**, da zaključate skalu i poredite mjesta na jednoj skali. [Boja i ekspozicija](colour-and-exposure.md#follow-the-view) |
| **Ista gustina pri svakom zumiranju** | uključeno | | Boja znači isti broj redova po površini tla, koliko god da ste blizu. Sprajt koji granice pixela uvećavaju (izdaleka) ili smanjuju (izbliza) zadržava toplotu koju bi dodao njegova prava veličina, pa slika izložena izdaleka ne blijedi kada uletite u nju. Isključeno, ograničen sprajt dodaje punu težinu pri svojoj ograničenoj veličini. [Oblik sprajta](sprite-shape.md#pixel-clamps) |
| **Spljošti na ravan tla** | isključeno | | [Oblik sprajta](sprite-shape.md#flatten-onto-ground-plane) |

### Boje toplote (zatvoren) {#heat-colours-closed}

| Kontrola | Podrazumijevano | Detalji |
|---|---|---|
| Uzorci grupa i **Razdvajanje boja** (samo Toplota timova) | 1,4 | [Toplota timova](team-heat.md) |
| Uređivač **Skala toplote** (*Pozitivno (timovi koji dodaju)* u Razlici, *Skala neprozirnosti* u Toploti timova) | prozirno → crveno → žuto → bijelo | [Boja i ekspozicija](colour-and-exposure.md#the-ramp-editor) |
| **Vrati na prozirno → crveno → žuto → bijelo** | | |
| Skala **Negativno (timovi koji oduzimaju)** (samo Razlika) | prozirno → zeleno → plavo → ljubičasto | [Razlika](difference.md#colours) |

### Granice pixela sprajta (zatvoren) {#sprite-pixel-clamps-closed}

| Kontrola | Podrazumijevano | Raspon (gornja granica prevlačenja) | Detalji |
|---|---|---|---|
| **Najmanji radijus u pikselima** | 1 px | 0-16 (512) | [Oblik sprajta](sprite-shape.md#pixel-clamps) |
| **Najveći radijus u pikselima** | 96 px | 2-1024, logaritamski (8192) | [Oblik sprajta](sprite-shape.md#pixel-clamps) |

### Dubina (otvoren) {#depth-open}

| Kontrola | Podrazumijevano | Detalji |
|---|---|---|
| **Sakrij iza terena** | uključeno | [Dubina i culling](depth-and-culling.md#hide-behind-terrain) |
| **Skriveno iza geometrije** | 0,8 (*80 % tamnije*) | [Dubina i culling](depth-and-culling.md#hidden-behind-geometry) |

### Culling po udaljenosti (zatvoren) {#distance-culling-closed}

| Kontrola | Podrazumijevano | Raspon (gornja granica prevlačenja) | Detalji |
|---|---|---|---|
| **Blizu** | isključeno (0) | 0,5-5000 m, logaritamski, dno staze = isključeno (200.000) | [Dubina i culling](depth-and-culling.md#distance-culling) |
| **Daleko** | isključeno (0) | 1-200.000 m, logaritamski, dno = isključeno (10.000.000) | [Dubina i culling](depth-and-culling.md#distance-culling) |
| **Sijeci ravninom** | uključeno | | [Dubina i culling](depth-and-culling.md#distance-culling) |
| **Sijeci i nivo** | uključeno | | [Dubina i culling](depth-and-culling.md#distance-culling) |

Tipke: `[` i `]` pomjeraju daleku granicu unutra i van, `\` je uključuje ili isključuje ([Dubina i culling](depth-and-culling.md#keyboard)).

### Smjer i Vrijednost {#direction-and-value}

Još dva odjeljka nalaze se ispod Oblika toplote. **Smjer** crta svaki red kao klin i dodaje strelice: vidi [Usmjerenu toplotu](directional-heat.md). **Vrijednost** ponderiše toplotu prema tome koliko je svaki red koštao ili donio: vidi [Ponderisanje vrijednosti](value-weighting.md).

## Šta se čuva {#what-is-saved}

Gore navedene postavke toplote se ne čuvaju između sesija: ponovno učitavanje stranice vraća podrazumijevane vrijednosti. U pregledniku se čuvaju dvije stvari: posljednja brzina reprodukcije (`heat3d.speed`, vidi [Vremensku liniju](timeline.md)) i postavke udaljenih figura [preklapanja figura](box-replay.md) (stil simbola, veličina, oznake pogodaka i tako dalje). Tako je i s jezikom, [obrnutim svjetskim osama](camera.md#invert-world-axis), zapamćenim imenima automobila na kartici trke i [bibliotekom nivoa](level-library.md). Potpun spisak je na [Sačuvane postavke](ref-settings-storage.md).
