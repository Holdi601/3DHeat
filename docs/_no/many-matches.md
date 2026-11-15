---
title: "Mange kamper samtidig"
parent: "Replay"
nav_order: 2
lang: "no"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: true
---

# Mange kamper samtidig

**Mange kamper samtidig** spiller av mange kamper oppå hverandre, slik at du ser hvor hver kamps spillere vanligvis går. Bruk det til å sammenligne hundrevis eller tusenvis av kamper i ett bilde.

Hver kamp starter ved sin egen begynnelse, og enhetene beveger seg som figurer. Filene går rett inn i grafikkortet, og ingen full tabell bygges, så det spilles jevnt der en vanlig innlasting ville gå tom for minne.

![Ti stridsvognkamper lagt oppå hverandre, én farge per kamp](../assets/img/no/many-matches.webp)

## Slik bruker du den {#how-to-use-it}

1. Åpne **Mange kamper samtidig** i sidepanelet for Varmekart.
2. Trykk **Filer…** (velg mange filer), **Mappe…** (en mappe og dens undermapper) eller **Legg til mappe…** (legg til i det som er lastet inn).
3. Visningen bytter til figuroverlegget og starter ved begynnelsen. Trykk **Spill av**.

Hver fil er én kamp (eller inneholder flere). Parquet-filer og [`.3dheat`](container.md)-beholdere fungerer. En fil trenger en posisjon-, tid- og enhetskolonne; navne-, type- og sidekolonner beholdes. Andre filer, og sidefilene til konvertere (flytur, meldinger, hendelser, chat, mål), hoppes over. For en vanlig tabell, se [Få inn data](getting-data-in.md).

## Innstillinger {#settings}

| Innstilling | Hva den gjør |
|---|---|
| **Etter lag** / **Etter kamp** | Farge etter side, eller en farge per kamp. |
| **Marker hvor enheter døde** | Et merke der hver enhet døde, i 10 s, 30 s, 120 s, eller alle så langt. |

Panelet viser hvor mange kamper, enheter, rader og posisjoner som ble lest, minnet som ble brukt, og innlastingstiden. *Plass til* er hvor mange flere posisjoner grafikkortet fortsatt kunne ta. *Figurer fra* er størrelsen på skjermen under hvilken en enhet tegnes som en liten pil i stedet for sin figur.

Figurene bruker de samme kontrollene som [kampreplayet](match-replay.md#figures): **Figurstørrelse**, **Minste figur på skjermen** og **På avstand**.

## Tips {#tips}

- Når alt ikke ville fått plass i minnet, tynnes posisjonene (bare én posisjon hver få meter beholdes), og panelet sier det.
- Varmemodiene virker også på overleggets data.
- For statistikk over tusenvis av kamper uten å tegne dem, se [Massanalyse](mass-analysis.md).
