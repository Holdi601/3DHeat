---
title: "Ostale trkaće igre"
parent: "Analiza utrke"
nav_order: 59
lang: "bs"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Ostale trkaće igre u pregledniku

Preglednik čita krugove iz mnogo trkaćih igara, ne samo iz jedne. Ova stranica ih navodi i kaže kako se krug izvuče iz svake.

## Igre {#the-games}

| Igra | Snimač | Klizanje u datoteci? | Svijet zrcaljen? | Napomene |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out preko UDP-a), ili datoteke krugova FH Companion plus njihove `.tele.gz` | da, po točku (normalizovano) | da (svijet je lijevo orijentisan) | `.tele.gz` uz svaku datoteku kruga iz FH Companion daje klizanje svakog točka; sama datoteka kruga to ne daje |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (dijeljena memorija) | da, po točku | izmjereno iz krugova | i ABS i kontrola vuče u radu, opterećenja točkova, temperature |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | ne, izračunato iz brzina točkova | izmjereno iz krugova | reli: rastresto tlo i skokovi se ocjenjuju drugačije |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | ne | izmjereno iz krugova | nema brzina točkova |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (mod) | ne, izračunato iz brzina točkova | izmjereno iz krugova | |
| Trackmania | Openplanet dodatak, `telemetry --game trackmania --install` | koeficijent klizanja po točku | izmjereno iz krugova | arkadna fizika: klizanja se ocjenjuju drugačije |
| iRacing | ništa: sopstvena `.ibt` datoteka | ne (ne bilježi se); izračunato iz skretanja (yaw) | ne (zasnovano na GPS-u) | uključi bilježenje u autu tipkama Alt+L |

## Kako snimiti krug {#how-to-record-a-lap}

1. Izaberi svoju igru u tabeli i podesi je kako kaže stranica snimača za tu igru (postavka u igri, mod, ili ništa za iRacing). Koraci se razlikuju po igri, pa su u dokumentima snimača: [GameCapture: igre](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Pokreni snimač, pa vozi. Snimač piše jednu datoteku po krugu.
3. Na kartici **Analiza utrke** pritisni **Učitaj datoteke krugova…** i izaberi dva ili više krugova iste staze (vidi [Učitavanje krugova](race-loading-laps.md)).

Za reli igre snimač daje jednu datoteku po vožnji etape, a za Forzu je najlakši početak biblioteka FH Companion sa `.tele.gz` datotekama uz datoteke krugova.

## Šta snimači dokumentuju {#what-the-recorders-document}

Kako se svaka igra snima, šta šalje, izvori za njene rasporede i koje staze se mogu izvesti iz njenih datoteka, to dokumentuju snimači: [GameCapture: igre](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (javno, u [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)), a datoteku kruga koju piše svaki snimač opisuje [GameCapture: format kruga](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Šta preglednik radi s njima {#what-the-viewer-does-with-them}

Svaka igra na kraju postane datoteke `heat3d-lap` (ili CSV krug, ili se čita direktno, kao iRacing-ova `.ibt`), sa kanonskim imenima kanala iz `src/race/schema.ts` i blokom `meta` koji kaže šta njihovi brojevi znače: kako je skalirano njihovo klizanje, da li je staza, reli ili arkada, i površina kad je poznata. Zato kartica **Analiza utrke** sve tretira jednako. Kad nijedan model staze nije učitan, kartica **Analiza utrke** crta put iz rasporeda samih krugova, pa je svaka igra upotrebljiva i bez modela.

Što nijedna reli igra ne šalje, klizanje guma, preglednik izračunava: iz kontaktne površine svakog točka ili brzine površine u odnosu na brzinu auta tamo gdje igra jednu šalje (`(točak - auto) / auto`), a iz njegove rotacije i radijusa kotrljanja izmjerenog na samom krugu tamo gdje igra šalje samo rotaciju. Ugao drifta dolazi iz sopstvene brzine auta (Forza, AC igre, Trackmania, RBR), iz brzine u svijetu projektovane na osi auta (EA WRC, DiRT, BeamNG), ili iz smjera u odnosu na putanju. Da li je auto u zraku određuje se iz kontakta točkova, opterećenja ili ovjesa. Vidi `src/race/derive.ts`.

Gdje je svijet igre lijevo orijentisan, kao Forzin, staza se u pregledniku prikazuje zrcaljena. Upravljanje i ovjes u krugovima to otkrivaju, a kartica **Analiza utrke** nudi da obrne jednu osu. Igre čija orijentacija nije dokumentovana (RBR, BeamNG, Trackmania) obrađuju se na isti način: izmjeri se, ne pretpostavlja.

Pored vozačkih kanala, snimači čuvaju ono što svaka igra dodaje: ABS i kontrolu vuče AC igara u radu, raspodjelu kočnica, DRS, ograničavač u boksu, pojačanje (boost) i vijek kočionih obloga i diskova. iRacing-ove postavke asistenata, raspodjelu kočnica, gorivo, temperature ulja i vode, i svaki drugi kanal koji bilježi pod svojim imenom. Preglednik ih crta iz svoje tabele kanala, kao lampice, nivoe, simbole i grafikone, pa snimanje više kanala ne traži promjenu u pregledniku.
