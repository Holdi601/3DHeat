---
title: "Figurat në mbivendosje figurash"
parent: "Figurat"
grand_parent: "Riluajtja"
nav_order: 2
lang: "sq"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figurat në mbivendosje figurash

Kjo faqe flet për kthimin e kutive në figura të vogla 3D të asaj që ishte në të vërtetë çdo njësi, dhe për tymin dhe zjarrin që lënë pas figurat. Kontrollet e vetë riprodhimit janë te [Riprodhimi i ndeshjes](match-replay.md).

Te [riprodhimi i kutive](box-replay.md) dhe riprodhimi i figurave të skedës Match, **Figura në vend të kutive** (e ndezur si parazgjedhje) vizaton çdo person të gjallë si figurën e asaj që është: një ushtar në këmbë, tanku që drejton dikush, avioni që është një gjurmë Tacview. Figura ka ngjyrën, vendin dhe drejtimin e kutisë. Për avionët dhe raketat ka edhe lartësinë (pitch) dhe, aty ku të dhënat kanë një kolonë Roll, animin. **Madhësia e figurës** i shkallëzon; 1 herë është madhësia e vërtetë. Klikimet mbi një figurë përgjigjen si klikimet mbi kutinë e saj.

## Cilën figurë {#which-figure}

Kolonat e vetë të dhënave për emrin dhe llojin vendosin. Rregullat e plota, me emrat e kolonave, janë te [Figurat](figures.md#which-figure-a-unit-gets). Të dhënat pa asnjërin lloj kolone janë të dhëna njerëzish: të gjithë janë ushtarë.

Përputhja ruhet në memorje sipas etiketës, kështu që një kornizë kushton vetëm vendosjen. Një njësi e të dhënave është një metër, përveç rastit kur të dhënat thonë sa madh është një objekt i ndjekur (eksporti CS2 thotë se një lojtar është 32 njësi i gjerë); figurat shkallëzohen sipas kësaj.

Një paketë opsionale figurash e tua mund të zëvendësojë figurat e katalogut në makinën tënde; shih [Figurat](figures.md#an-optional-local-figure-pack).

## Efektet {#effects}

Rreshtat e ngjarjeve që lënë diçka pas për ca kohë vizatohen aty ku ndodhën për aq kohë sa zgjat, me ngjyrën e atij që i shkaktoi: një tym (rreth 18 s), një molotov ose incendiary (7 s), një shkëndijë (rreth një sekondë) dhe një shpërthim HE (nën një sekondë), një decoy (15 s), një bombë e vendosur (40 s). Vijnë nga një kolonë ngjarjesh (Event, Events) me etiketën `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` ose `plant` - eksporti CS2 i shkruan në shpërthim.

## Riprodhimi i ndeshjes: mjetet e Tacview {#match-replay-tacviews-tools}

Kamerat, faqeshënuesit, ekrani taktik, statistikat, etiketat, **Vijat vertikale**, lista e ngjarjeve dhe dritarja e grafikëve përshkruhen te [Riprodhimi i ndeshjes](match-replay.md). [Barazia me Tacview](tacview-parity.md) liston çdo veçori të Tacview dhe ku qëndron ajo.
