---
title: "Druge dirkalne igre"
parent: "Analiza dirke"
nav_order: 59
lang: "sl"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Druge dirkalne igre v pregledovalniku

Pregledovalnik bere kroge iz mnogih dirkalnih iger, ne samo iz ene. Ta stran jih našteje in pove, kako iz vsake dobite krog.

## Igre {#the-games}

| Igra | Snemalnik | Zdrsavanje v datoteki? | Svet zrcaljen? | Opombe |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out prek UDP), ali datoteke krogov FH Companion ter njegove `.tele.gz` | da, za vsako kolo (normirano) | da (svet z levo orientacijo) | `.tele.gz` ob vsaki datoteki kroga FH Companion da zdrs vsakega kolesa; sama datoteka kroga tega ne da |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (skupni pomnilnik) | da, za vsako kolo | izmerjeno iz krogov | tudi delovanje ABS in trakcijske kontrole, obremenitve koles, temperature |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | ne, izračuna se iz hitrosti koles | izmerjeno iz krogov | reli: rahla podlaga in skoki se ocenjujeta drugače |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | ne | izmerjeno iz krogov | ni hitrosti koles |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (modifikacija) | ne, izračuna se iz hitrosti koles | izmerjeno iz krogov | |
| Trackmania | vtičnik Openplanet, `telemetry --game trackmania --install` | koeficient zdrsa za vsako kolo | izmerjeno iz krogov | arkadna fizika: zdrsi se ocenjujejo drugače |
| iRacing | ni potrebno: lastna datoteka `.ibt` | ne (ni zabeleženo); izračuna se iz zasuka | ne (na podlagi GPS) | v avtu vklopite beleženje z Alt+L |

## Kako posneti krog {#how-to-record-a-lap}

1. V tabeli izberite svojo igro in jo nastavite tako, kot piše na strani snemalnika za to igro (nastavitev v igri, modifikacija ali nič za iRacing). Koraki se pri posameznih igrah razlikujejo, zato so v dokumentih snemalnikov: [GameCapture: igre](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Zaženite snemalnik in vozite. Za vsak krog zapiše eno datoteko.
3. Na zavihku **Analiza dirke** pritisnite **Naloži datoteke krogov…** in izberite dva ali več krogov iste proge (glejte [Nalaganje krogov](race-loading-laps.md)).

Pri reli igrah snemalnik da eno datoteko za vsak zagon etape, pri Forzi pa je najlažji začetek knjižnica FH Companion z datotekami `.tele.gz` ob datotekah krogov.

## Kaj dokumentirajo snemalniki {#what-the-recorders-document}

Kako je posamezna igra posneta, kaj pošlje, viri za njene postavitve in katere proge je mogoče izvoziti iz njenih datotek, dokumentirajo snemalniki: [GameCapture: igre](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (javno, v [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Datoteko kroga, ki jo zapiše vsak snemalnik, opisuje [GameCapture: format kroga](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Kaj pregledovalnik naredi z njimi {#what-the-viewer-does-with-them}

Vsaka igra na koncu da datoteke `heat3d-lap` (ali CSV datoteko kroga, ali pa se bere neposredno, kot `.ibt` iRacing), s kanonskimi imeni kanalov iz `src/race/schema.ts` in blokom `meta`, ki pove, kaj pomenijo njene številke – kako je skaliran njen zdrs, ali gre za krožno, reli ali arkadno vožnjo, podlago, če je znana – zato jih zavihek **Analiza dirke** obravnava enako. Kadar ni naložen model proge, zavihek **Analiza dirke** nariše cesto iz razporeditve samih krogov, tako da je vsaka igra uporabna tudi brez modela.

Tega, kar nobena reli igra ne pošlje – zdrsa pnevmatik – pregledovalnik izračuna: iz hitrosti stične ploskve ali površine vsakega kolesa glede na hitrost avta, kjer igra eno pošlje (`(kolo - avto) / avto`), iz vrtenja in polmera kotaljenja, izmerjenega na samem krogu, kjer pošlje samo vrtenje. Kot zdrsa prihaja iz lastne hitrosti avta (Forza, igre AC, Trackmania, RBR), iz hitrosti sveta, projicirane na osi avta (EA WRC, DiRT, BeamNG), ali iz smeri vožnje glede na pot. Ali je avto v zraku, se ugotovi iz stika koles, obremenitev ali vzmetenja. Glejte `src/race/derive.ts`.

Kjer ima igra svet z levo orientacijo – Forzin je tak – je proga v pregledovalniku zrcaljena; to pokažejo zasuki in vzmetenje samih krogov, zavihek **Analiza dirke** pa ponudi, da obrne os. Igre, pri katerih orientacija ni dokumentirana (RBR, BeamNG, Trackmania), se obravnavajo enako: izmerjeno, ne predpostavljeno.

Poleg vozniških kanalov snemalniki shranijo, kar doda vsaka igra: delovanje ABS in trakcijske kontrole pri igrah AC, nastavitev zavorne moči, DRS, omejevalnik na boksih, turbo ter življenjsko dobo zavornih oblog in diskov; pri iRacingu nastavitve pomočnikov, zavorno moč, gorivo, temperature olja in vode ter vsak drug kanal, ki ga beleži pod svojim imenom. Pregledovalnik jih riše iz svoje tabele kanalov – z lučkami, stopnjami, znaki in grafi – zato snemanje več podatkov ne zahteva nobene spremembe v pregledovalniku.
