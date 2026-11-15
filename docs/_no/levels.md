---
title: "Baner og bakgrunnsgeometri"
nav_order: 13
has_children: true
lang: "no"
source: "levels.md"
source_hash: "1283adc1548a"
translated: true
outdated: false
---

# Nivåer og bakgrunnsgeometri

Et nivå er stedet i 3D der spillet foregikk – et kart, en by, en bane. Legg det bak dataene dine, så kan du se *hvor* varmen er. Panelet **Bakgrunn / nivå** (se [Ordliste](glossary.md) for «nivå») gir deg tre slags kontekst:

- et **kartbilde**, georeferert med to ankre – se [Kartbilder](map-images.md);
- et **3D-nivå** – `.glb`, `.gltf`, `.obj`, `.stl` eller `.ply` – delt i bakke, strukturer og vann og forenklet ved import – se [3D-nivåer](model-levels.md) og [Nivåutseende](level-appearance.md);
- en **verdensbakgrunn** – for et opptak som sier hvor på jorden det er (en Tacview ACMI-fil), det virkelige terrenget, veiene, vannet, flyplassene og bygningene, lastet ned fra åpne data – se [Verdensbakgrunn](world-backdrop.md).

Uten noe lastet inn er scenen mørk med et rutenett og fargede akser (**Rutenett** og **Akser** i [Kamera og scene](camera.md)), og panelet sier *Ingenting lastet inn – scenen viser et rutenett og akser. Legg til et kartbilde eller en nivåmodell for å gi varmen kontekst.*

Nivået deles av alle tre fanene: et løp lastet inn i Løpsanalyse-fanen er det samme nivået som varmekartet viser.

![Panelet Bakgrunn / nivå med et nivå lastet inn: knappene Kartbilde og 3D-modell, Teater, Opasitet, Lysstyrke, Lagre i biblioteket og listen Bibliotek](../assets/img/no/level-panel.webp)

## Legg et nivå bak dataene dine {#put-a-level-behind-your-data}

1. Last inn dataene dine først ([Få inn data](getting-data-in.md)), slik at nivået tilpasses dem.
2. Åpne **Bakgrunn / nivå** i sidepanelet.
3. Trykk **Kartbilde…** for et bilde eller **3D-modell…** for et 3D-nivå, og velg filen. For et opptak fra den virkelige verden, bruk **Verdensbakgrunn** eller **Teater** i stedet.
4. Vent til fremdriftslinjen er ferdig. En stor modell blir forenklet først (se **Forenklingsmål** nedenfor).
5. Trykk **F** i visningen for å ramme inn alt. Bruk **Opasitet** og **Lysstyrke** til varmen skiller seg ut fra nivået.
6. Trykk **Lagre i biblioteket** hvis du skal bruke nivået igjen ([Nivåbiblioteket](level-library.md)).

## Hva et nivå gjør for varmen {#what-a-level-does-for-the-heat}

- Det **okkluderer**: datapunkter bak det blir dempet per flate, og datapunkter bak terrenget blir skjult ([Dybde og avskjæring](depth-and-culling.md)). Uten nivå finnes det ingen okklusjon.
- Det blir **kuttet** av [Skiven](slice.md) og, med *Skjær også nivået*, av [avskjæring etter avstand](depth-and-culling.md#distance-culling), sammen med varmen.
- Det er det eneste [dybdeskarphet](camera.md#depth-of-field) gjør uskarpt, i tillegg til rutenettet og boksene.
- Et 3D-nivå **utvider kameraets fjerne plan** når det er større enn dataene: nær og fjern plan kalibreres ut fra datasettet, og et eksportert kart flere kilometer på tvers ville ellers ligge helt bak det fjerne planet og etterlate en tom visning. Det fjerne planet blir 3 × nivåets horisontale utstrekning når den er større, det nære planet flyttes med det (minst fjern / 100 000) for å beholde dybdepresisjonen okklusjonen avhenger av, og flyfarten heves til minst utstrekning / 12. Det blir bare utvidet, aldri innsnevret.

## Panelet, fra topp til bunn {#the-panel-top-to-bottom}

| Del | Detaljer |
|---|---|
| **Kartbilde…**, **3D-modell…** | Last inn ett; det erstatter gjeldende nivå. |
| **Verdensbakgrunn**, **Glem kartfliser** | Bare for et datasett med geografisk referanse: bygg det virkelige stedet under det som nivå, eller slett de nedlastede flisene. [Verdensbakgrunn](world-backdrop.md) |
| **Forenklingsmål** | Trekantbudsjettet for neste modellimport: *Full – ingen forenkling* (standard), *Høy – 8 M*, *Middels – 3 M*, *Lav – 800 k*, *Silhuett – 100 k*. [3D-nivåer](model-levels.md#simplification) |
| Fremdrift og **Avbryt** | Mens dekoding eller import pågår. |
| Importmerknad | Trekanter før og etter, delingen i bakke / strukturer / vann, og detaljnivået som ble brukt. |
| Navn og størrelse | `bredde×høyde px · x × z m/px` for et bilde, `N trekanter (fra M)` for en modell. |
| **Opasitet**, **Lysstyrke** | Begge typene. |
| Bildekontroller | **Avmett**, **Speilvend nord/sør**, **Plassering** (to ankre), **Tilpass til datagrensene**, **Høyde**. [Kartbilder](map-images.md) |
| Modellkontroller | Terrengrelieff, vann, bakketrekanter, trådmodell, tekstur, registrert farge, strukturer, delklassifisering. [Nivåutseende](level-appearance.md) |
| **Lagre i biblioteket**, **Fjern** | [Nivåbiblioteket](level-library.md); Fjern laster ut nivået. |
| **Bibliotek** | Nivåer lagret i denne nettleseren. [Nivåbiblioteket](level-library.md) |

## Sider i denne delen {#pages-in-this-section}

- [Kartbilder](map-images.md)
- [3D-nivåer](model-levels.md) – formater, deler, klassifisering, forenkling, teksturer
- [Nivåutseende](level-appearance.md) – hver kontroll for et 3D-nivå
- [Nivåbiblioteket](level-library.md)
- [Verdensbakgrunn](world-backdrop.md) – den virkelige verden under et opptak, fra åpne data

Hvordan man får nivåer ut av spill og motorer, er jobben til de separate eksportverktøyene (se repositoriets [README](https://github.com/Holdi601/3DHeat/blob/main/README.md)); kontrakten de skriver til, er oppsummert i [3D-nivåer](model-levels.md#the-exporter-contract).
