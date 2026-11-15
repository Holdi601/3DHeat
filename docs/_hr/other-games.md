---
title: "Ostale igre utrka"
parent: "Analiza utrke"
nav_order: 59
lang: "hr"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Ostale igre utrka u pregledniku

Preglednik čita krugove iz mnogih igara utrka, ne samo iz jedne. Ova stranica ih navodi i kaže kako dobiti krug iz svake.

## Igre {#the-games}

| Igra | Snimatelj | Klizanje u datoteci? | Svijet zrcaljen? | Napomene |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out preko UDP-a), ili datoteke krugova iz FH Companiona plus njihove `.tele.gz` | da, po kotaču (normalizirano) | da (svijet s lijevom orijentacijom) | `.tele.gz` uz svaki krug iz FH Companiona daje klizanje svakog kotača; sama datoteka kruga to ne daje |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (dijeljena memorija) | da, po kotaču | izmjereno iz krugova | uz to rad ABS-a i kontrole proklizavanja, opterećenja kotača, temperature |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | ne, izračunava se iz brzina kotača | izmjereno iz krugova | reli: rahlo tlo i skokovi procjenjuju se drukčije |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | ne | izmjereno iz krugova | nema brzine kotača |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (mod) | ne, izračunava se iz brzina kotača | izmjereno iz krugova | |
| Trackmania | dodatak Openplanet, `telemetry --game trackmania --install` | koeficijent klizanja po kotaču | izmjereno iz krugova | arkadna fizika: klizanja se procjenjuju drukčije |
| iRacing | nema: vlastita datoteka `.ibt` | ne (ne bilježi se); izračunava se iz skretanja (yaw) | ne (temelji se na GPS-u) | uključi bilježenje u autu tipkom Alt+L |

## Kako snimiti krug {#how-to-record-a-lap}

1. Odaberi svoju igru u tablici i postavi je onako kako piše na stranici snimatelja za tu igru (postavka u igri, mod ili ništa za iRacing). Koraci se razlikuju od igre do igre, pa su u dokumentima snimatelja: [GameCapture: igre](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Pokreni snimatelj, pa vozi. Piše jednu datoteku po krugu.
3. Na kartici **Analiza utrke** pritisni **Učitaj datoteke krugova…** i odaberi dva ili više krugova iste staze (vidi [Učitavanje krugova](race-loading-laps.md)).

Kod reli igara snimatelj daje jednu datoteku po vožnji etape, a za Forzu je najlakši početak biblioteka FH Companiona s njezinim datotekama `.tele.gz` uz datoteke krugova.

## Što dokumentiraju snimatelji {#what-the-recorders-document}

Kako se svaka igra snima, što šalje, izvori za njezine rasporede i koje se staze mogu izvesti iz njezinih datoteka dokumentira snimatelj: [GameCapture: igre](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (javno, u [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Datoteku kruga koju piše svaki snimatelj opisuje [GameCapture: format datoteke kruga](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Što preglednik radi s njima {#what-the-viewer-does-with-them}

Svaka igra na kraju postaje datoteke `heat3d-lap` (ili CSV datoteka kruga, ili se čita izravno, kao `.ibt` od iRacinga), s kanonskim nazivima kanala iz `src/race/schema.ts` i blokom `meta` koji kaže što znače njezini brojevi: kako je skalirano njezino klizanje, je li staza, reli ili arkada, površina ako je poznata. Zato kartica **Analiza utrke** sve tretira jednako. Kada nije učitan model staze, kartica **Analiza utrke** iscrtava cestu iz vlastitog raspona krugova, pa je svaka igra upotrebljiva i bez njega.

Klizanje guma, koje nijedna reli igra ne šalje, preglednik sam izračunava: iz brzine dodirne površine ili površine svakog kotača u odnosu na brzinu auta tamo gdje igra jednu šalje (`(wheel - car) / car`), a iz okretanja i polumjera kotrljanja izmjerenog na samom krugu tamo gdje šalje samo okretanje. Kut driftanja dolazi iz vlastite brzine auta (Forza, AC igre, Trackmania, RBR), iz brzine svijeta projicirane na osi auta (EA WRC, DiRT, BeamNG) ili iz smjera vožnje u odnosu na putanju. Je li auto u zraku određuje kontakt, opterećenje ili ovjes njegovih kotača. Vidi `src/race/derive.ts`.

Ako je svijet igre lijevo orijentiran - Forzin jest - staza se u pregledniku prikazuje zrcaljeno. Krugovi sami po upravljanju i ovjesu to otkrivaju, a kartica **Analiza utrke** nudi zamjenu osi. Igre čija orijentacija nije dokumentirana (RBR, BeamNG, Trackmania) obrađuju se na isti način: izmjeri se, ne pretpostavlja.

Osim kanala vožnje, snimatelji čuvaju ono što svaka igra dodaje: rad ABS-a i kontrole proklizavanja u AC igrama, raspodjelu kočnica, DRS, ograničivač u boksu, pojačanje te trajnost kočionih pločica i diskova; iRacingove postavke pomoći, raspodjelu kočnica, gorivo, temperature ulja i vode te svaki drugi kanal koji bilježi pod svojim nazivom. Preglednik ih crta iz svoje tablice kanala - lampice, razine, znakove, grafove - pa snimanje više podataka ne traži nikakvu promjenu preglednika.
