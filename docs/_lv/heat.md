---
title: "Siltums"
parent: "Siltuma režīmi"
nav_order: 1
lang: "lv"
source: "heat.md"
source_hash: "b895631187ea"
translated: true
outdated: false
---

# Siltums

Siltums iekrāso vietas, kur notika daudz lietu: sarkanu, kur notika mazliet, baltkarstu, kur notika daudz. Tas atbild uz jautājumu "kur tas notiek un cik daudz".

**Siltums** (taustiņš 1) ir noklusējuma režīms. Katra redzamā [rinda](glossary.md) pievieno kamerai vērstu apaļu [spraitu](glossary.md). Pārklājošies spraiti saskaitās peldošā komata buferī. Summa tiek kartēta caur krāsu skalu — pēc noklusējuma caurspīdīgs → sarkans → dzeltens → balts — un zīmēta pāri ainai.

![Siltums 3D līmenī: karstas vietas ēku iekšpusē un virs tām](../assets/img/lv/shooter-heat.webp)

Attēlā redzams šāvēja raunda siltums uz līmeņa ar ēkām: karstās vietas atrodas telpās un uz kāpnēm, ne tikai uz zemes.

## Kā lietot {#how-to-use-it}

1. Ielādē datus un nospied `1` (vai izvēlies **Siltums** režīmu joslā).
2. Ja viss ir balts vai tukšs, nospied **Automātiska ekspozīcija pēc lauka** sadaļā **Siltuma forma**.
3. Maini **Spraita rādiusu**, līdz blakus punkti saplūst joslās: mazs rāda atsevišķus plankumus, liels — apgabalus.
4. Atver **Siltuma krāsas**, lai mainītu krāsas, vai **Dziļums**, lai pauguri un sienas paslēptu siltumu aiz sevis.

![Sānjoslas sadaļas Siltuma forma un Siltuma krāsas, abas atvērtas](../assets/img/lv/heat-panel.webp)

Tie paši paneļi veido [Starpību](difference.md), [Komandu siltumu](team-heat.md) un [Līniju siltumu](line-heat.md). Tie atšķiras tajā, ko pievieno (ar zīmi, krāsotu vai pa līnijām), nevis tajā, kā.

## Paneļi un to noklusējumi {#the-panels-and-their-defaults}

Katra vadība ir izskaidrota savā lapā; kolonna Detaļas ved uz to. Slīdņiem blakus ir ierakstāms lodziņš un vilkšanas rokturis (mazs satvērējs pa labi: velc uz augšu vai leju, jo tālāk, jo ātrāk; Shift smalkai regulēšanai). Ja slīdņa sliedes gals ir pirms reālās robežas, rokturis var pārvilkt pāri tai līdz šeit dotajai *kustināšanas robežai*. Vērtības, kas atzīmētas *ielādē*, tiek pārrēķinātas katrai jaunai datu kopai.

### Siltuma forma (atvērta) {#heat-shape-open}

| Vadība | Noklusējums | Diapazons (kustināšanas robeža) | Detaļas |
|---|---|---|---|
| **Spraita rādiuss** | 6 m; ielādē izmērs / 120 | 0,05–2000 m, logaritmiski (50 000) | [Sprite forma](sprite-shape.md#sprite-radius) |
| **Intensitāte centrā** | 1 | 0–10 (1000) | [Sprite forma](sprite-shape.md#centre-and-edge-intensity) |
| **Intensitāte malā** | 0 | −2–10 (1000) | [Sprite forma](sprite-shape.md#centre-and-edge-intensity) |
| **Gradienta forma** | *Kritums* | *Kritums* / *Līkne* | [Sprite forma](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Kritums** (tikai Kritumam) | 1,6 | 0,1–8 (64) | [Sprite forma](sprite-shape.md#falloff) |
| **Gluds gradients** (tikai Kritumam) | ieslēgts | | [Sprite forma](sprite-shape.md#falloff) |
| Līkņu redaktors (tikai Līkne) | priekšiestatījums *Gluda* | | [Sprite forma](sprite-shape.md#the-curve-editor) |
| **Piesātinājuma punkts** | 24; ielādē aplēse, pēc tam izmērīts | 0,1–4000, logaritmiski (10 000 000) | [Krāsa un ekspozīcija](colour-and-exposure.md#saturation-point) |
| **Minimālais siltums** | izslēgts (0) | 0–100% | [Krāsa un ekspozīcija](colour-and-exposure.md#minimum-heat) |
| **Reakcija uz blīvumu** | *Piesātinoša* | *Piesātinoša* / *Lineāra* / *Logaritmiska* | [Krāsa un ekspozīcija](colour-and-exposure.md#density-response) |
| **Automātiska ekspozīcija pēc lauka** | | poga | [Krāsa un ekspozīcija](colour-and-exposure.md#auto-exposure) |
| **Sekot skatam** | ieslēgts | | Katru reizi, kad kamera apstājas, ekspozīciju mēra no jauna, tāpēc reģions, kurā ielido, izmanto visu krāsu skalu. Nelielas izmaiņas tiek ignorētas, un skala slīd. Noņem atzīmi vai velc **Piesātinājuma punktu**, lai bloķētu skalu un salīdzinātu vietas vienā skalā. [Krāsa un ekspozīcija](colour-and-exposure.md#follow-the-view) |
| **Vienāds blīvums jebkurā tālummaiņā** | ieslēgts | | Krāsa nozīmē vienādu rindu skaitu uz zemes laukuma vienību neatkarīgi no tā, cik tuvu esi. Spraits, ko pikseļu ierobežojumi palielina (tālu) vai samazina (tuvu), saglabā siltumu, ko pievienotu tā patiesais izmērs, tāpēc attēls, ekspozēts no tāluma, neizbalē, kad tajā ielido. Izslēgts: ierobežots spraits pievieno visu savu svaru ierobežotajā izmērā. [Sprite forma](sprite-shape.md#pixel-clamps) |
| **Saplacināt uz zemes plaknes** | izslēgts | | [Sprite forma](sprite-shape.md#flatten-onto-ground-plane) |

### Siltuma krāsas (aizvērta) {#heat-colours-closed}

| Vadība | Noklusējums | Detaļas |
|---|---|---|
| Grupu krāsu paraugi un **Krāsu atdalīšana** (tikai Komandu siltumam) | 1,4 | [Komandu siltums](team-heat.md) |
| **Siltuma skala** redaktors (*Pozitīvā (pieskaitošās komandas)* Starpībā, *Necaurredzamības skala* Komandu siltumā) | caurspīdīgs → sarkans → dzeltens → balts | [Krāsa un ekspozīcija](colour-and-exposure.md#the-ramp-editor) |
| **Atiestatīt uz caurspīdīgs → sarkans → dzeltens → balts** | | |
| **Negatīvā (atņemošās komandas)** skala (tikai Starpībai) | caurspīdīgs → zaļš → zils → violets | [Starpība](difference.md#colours) |

### Spraitu pikseļu ierobežojumi (aizvērta) {#sprite-pixel-clamps-closed}

| Vadība | Noklusējums | Diapazons (kustināšanas robeža) | Detaļas |
|---|---|---|---|
| **Min. rādiuss pikseļos** | 1 px | 0–16 (512) | [Sprite forma](sprite-shape.md#pixel-clamps) |
| **Maks. rādiuss pikseļos** | 96 px | 2–1024, logaritmiski (8192) | [Sprite forma](sprite-shape.md#pixel-clamps) |

### Dziļums (atvērta) {#depth-open}

| Vadība | Noklusējums | Detaļas |
|---|---|---|
| **Slēpt aiz reljefa** | ieslēgts | [Dziļums un nogriešana](depth-and-culling.md#hide-behind-terrain) |
| **Paslēpts aiz ģeometrijas** | 0,8 (*par 80% tumšāks*) | [Dziļums un nogriešana](depth-and-culling.md#hidden-behind-geometry) |

### Atmešana pēc attāluma (aizvērta) {#distance-culling-closed}

| Vadība | Noklusējums | Diapazons (kustināšanas robeža) | Detaļas |
|---|---|---|---|
| **Tuvā** | izslēgta (0) | 0,5–5000 m, logaritmiski, trases apakša = izslēgts (200 000) | [Dziļums un nogriešana](depth-and-culling.md#distance-culling) |
| **Tālā** | izslēgta (0) | 1–200 000 m, logaritmiski, apakša = izslēgts (10 000 000) | [Dziļums un nogriešana](depth-and-culling.md#distance-culling) |
| **Griezt pa plakni** | ieslēgts | | [Dziļums un nogriešana](depth-and-culling.md#distance-culling) |
| **Griezt arī līmeni** | ieslēgts | | [Dziļums un nogriešana](depth-and-culling.md#distance-culling) |

Taustiņi: `[` un `]` velk tālo robežu uz iekšu un uz āru, `\` to pārslēdz ([Dziļums un nogriešana](depth-and-culling.md#keyboard)).

### Virziens un Vērtība {#direction-and-value}

Zem Siltuma formas ir vēl divas sadaļas. **Virziens** zīmē katru rindu kā ķīli un pievieno bultas: skat. [Virziena siltums](directional-heat.md). **Vērtība** sver siltumu pēc tā, cik katra rinda izmaksāja vai nopelnīja: skat. [Vērtības svēršana](value-weighting.md).

## Kas tiek saglabāts {#what-is-saved}

Augstāk minētie siltuma iestatījumi starp sesijām netiek saglabāti: lapas pārlādēšana atjauno noklusējumus. Divas lietas tiek glabātas pārlūkā: pēdējais atskaņošanas ātrums (`heat3d.speed`, skat. [Laika skala](timeline.md)) un [figūru pārklājuma](box-replay.md) tālo figūru iestatījumi (simbolu stils, izmērs, trāpījumu atzīmes un tamlīdzīgi). Tāpat tiek glabāta valoda, [apgrieztās pasaules asis](camera.md#invert-world-axis), cilnes Sacīkšu analīze atcerētie automašīnu nosaukumi un [līmeņu bibliotēka](level-library.md). Pilns saraksts ir lapā [Saglabātie iestatījumi](ref-settings-storage.md).
