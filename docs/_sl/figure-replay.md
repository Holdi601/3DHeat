---
title: "Figure v prekrivanju figur"
parent: "Figure"
grand_parent: "Ponovitev"
nav_order: 2
lang: "sl"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figure v prekrivanju figur

Ta stran govori o tem, kako se kvadrati spremenijo v majhne 3D figure tega, kar je vsaka enota resnično bila, ter o dimu in ognju, ki ga figure pustijo za seboj. Kontrole samega predvajanja so na [Predvajanje tekme](match-replay.md).

V [prekrivanju figur](box-replay.md) in v predvajanju figur na zavihku Tekma **Figure namesto kock** (privzeto vklopljeno) nariše vsako živo osebo kot figuro tega, kar je: vojaka na nogah, tank, ki ga nekdo vozi, ali letalo, ki ga predstavlja sled Tacview. Figura ima barvo, mesto in smer kvadrata. Za letala in rakete ima tudi nagib in, kadar podatki vsebujejo stolpec Roll, nagib v zavoju. **Velikost figur** jih skalira; 1-krat je prava velikost. Klik na figuro odgovori tako, kot bi odgovoril klik na njen kvadrat.

## Katera figura {#which-figure}

Odločijo imenski in vrstni stolpci podatkov. Polna pravila, z imeni stolpcev, so na [Figure](figures.md#which-figure-a-unit-gets). Podatki brez enega ali drugega stolpca so podatki o ljudeh: vsak je vojak.

Ujemanje je shranjeno v predpomnilnik za vsako oznako, zato sličica stane samo postavitev. Enota podatkov je meter, razen če podatki povedo, kako velika je ena sledena stvar (izvoz CS2 pove, da je igralec 32 enot širok); figure so skalirane tako, da se ujemajo.

Neobvezen paket lastnih figur lahko na vašem računalniku nadomesti figure iz kataloga; glejte [Figure](figures.md#an-optional-local-figure-pack).

## Učinki {#effects}

Vrstice dogodkov, ki za nekaj časa nekaj pustijo za seboj, se narišejo tam, kjer so se zgodile, za toliko časa, kolikor traja, v barvi tistega, ki jih je povzročil: dim (približno 18 s), molotov ali zažigalna bomba (7 s), bliskavica (približno sekundo) in eksplozija HE (manj kot sekundo), vaba (15 s), postavljena bomba (40 s). Prihajajo iz stolpca dogodkov (Event, Events), katerega oznaka je `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` ali `plant` – izvoz CS2 jih zapiše ob detonaciji.

## Predvajanje tekme: orodja Tacview {#match-replay-tacviews-tools}

Kamere, zaznamki, taktični prikaz, statistika, oznake, **Navpične črte**, seznam dogodkov in okno grafov so opisani na [Predvajanje tekme](match-replay.md). [Enakovrednost s Tacview](tacview-parity.md) našteje vsako funkcijo Tacview in kje stoji.
