---
title: "Cilësimet, njësitë dhe tastet"
nav_order: 19
lang: "sq"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Cilësimet, njësitë dhe tastet

Kontrollet e vogla në krye të shiritit anësor ndryshojnë mënyrën si flet shikuesi me ty: gjuhën, njësitë (metra ose këmbë, km/h ose nyje) dhe një modalitet ndihme që shpjegon ngjyrat. Zgjedhjet e tua kujtohen në shfletues.

## Kreu {#the-header}

Në krye të shiritit anësor:

| Kontrolli | Çfarë bën |
|---|---|
| **?** | Modaliteti i ndihmës: çfarë do të thotë çdo ngjyrë (gjithashtu `?` ose `F1`) |
| Menuja **Njësitë** | Metrike, Imperiale, Aviacion ose Detare |
| Butoni **...** pranë **Njësitë** | Hap "Zgjidh një njësi për çdo sasi": një listë zgjedhjeje për çdo sasi |
| Menuja **Gjuha** | Gjuha e shikuesit: [40 gjuhë](languages.md), ose ajo e shfletuesit |

![Kreu me menunë Njësitë dhe dritaren njësi-për-sasi të hapur](../assets/img/en/settings-units.webp)

Numrat që shkruan në një kuti mund të kenë pikë ose presje (`0.35` ose `0,35`). Shikuesi i lexon të dyja dhe i shfaq numrat ashtu si i shkruan gjuha e shikuesit.

## Njësitë {#units}

1. Zgjidh një paracaktim në menunë **Njësitë**. Të gjitha sasitë ndërrohen bashkë.
2. Për të ndryshuar vetëm një sasi, kliko butonin **...** pranë saj dhe zgjidh një njësi për atë sasi. Menuja shfaq atëherë një `*` pas paracaktimit.
3. Një sasi që nuk e ke vendosur ndjek paracaktimin. Zgjidh "Sipas paracaktimit" për t'u kthyer.

| Sasia | Metrike (parazgjedhja) | Imperiale | Aviacion | Detare |
|---|---|---|---|---|
| Distanca | km | mi | NM | NM |
| Lartësia, gjatësia | m | ft | ft | m |
| Shpejtësia | km/h | mph | kt | kt |
| Shpejtësia vertikale | m/s | ft/min | ft/min | m/s |
| Temperatura | °C | °F | °C | °C |
| Presioni | hPa | inHg | hPa | hPa |
| Masa, karburanti | kg, l | lb, gal | lb, gal | t, m³ |
| Këndi | shkallë | shkallë | shkallë | shkallë |

Njësi të tjera që mund të zgjedhësh për një sasi: distanca km, mi, NM; shpejtësia km/h, m/s, kt, mph; shpejtësia vertikale m/s, ft/min, m/min; temperatura °C, °F, K; presioni hPa, inHg, mmHg, psi; masa kg, lb, t; këndi shkallë ose NATO mils (6400 për rreth). Njësitë janë të njëjta kudo në shikues: etiketat, kartat, grafikët, statistikat.

## Modaliteti i ndihmës {#help-mode}

![Modaliteti i ndihmës: çfarë do të thotë çdo ngjyrë](../assets/img/en/help.webp)

Shtyp `?` ose `F1`, ose kliko butonin **?**. Ai shfaq *Çfarë do të thotë çdo ngjyrë*: legjendat për pamjen 3D, shkallët e nxehtësisë, ngjyrat e ekipeve, ngjyrat e nivelit, ngjyrat e statusit të paneleve, panelin e ndeshjes dhe pamjen e garës. Mbetet i ndezur deri sa ta fikësh. Te skeda Ndeshja shpjegon edhe ngjyrat e panelit të ndeshjes.

![Modaliteti i ndihmës te skeda Ndeshja](../assets/img/en/settings-help-match.webp)

## Çfarë kujton shfletuesi {#what-the-browser-remembers}

Këto cilësime mbahen në shfletuesin tënd ndërmjet vizitave (asgjë nuk dërgohet askund):

- gjuha, njësitë dhe modaliteti i ndihmës;
- cilësimet e riluajtjes për figurat, simbolet, etiketat, kamerën dhe ekranin taktik;
- shpejtësia e luajtjes dhe pasqyrimi;
- shënuesit për çdo regjistrim, vëllimet për çdo grup të dhënash, shtresat e objektivave;
- cilësimet e IA-së së jashtme (çelësi vetëm nëse e shënon *Mbaje mend*).

Cilësimet e nxehtësisë, filtrat dhe modaliteti nisin nga e para me çdo ngarkim. Lista e plotë, e gjeneruar: [Cilësimet e ruajtura](ref-settings-storage.md).

## Tastet që shikuesi i mban nga shfletuesi {#keys-the-viewer-keeps-from-the-browser}

Një seancë me të dhëna të mëdha merr kohë për t'u ngarkuar, kështu që shikuesi e ndalon shfletuesin ta hedhë pa dashje:

- `Ctrl`/`Cmd` + shkronja që do të shtypnin, ruanin, hapnin, rifreskonin, mbyllnin ose hapnin dritare të reja nuk bëjnë asgjë jashtë kutive të tekstit; `F1`, `F3`, `F5`, `F6` dhe `F7` nuk bëjnë asgjë.
- Mbyllja ose rifreskimi i skedës me të dhëna ose nivel të ngarkuar pyet së pari.
- Në ekran të plotë shikuesi kyç tastet që përdor (W, T, N, S, R, P, Q, Esc), kështu që shfletuesi nuk i merr.

Lista e saktë: [Tastet e shfletuesit](ref-browser-keys.md). Të gjitha tastet e vetë shikuesit: [Referenca e tastierës dhe miut](keyboard-reference.md).
