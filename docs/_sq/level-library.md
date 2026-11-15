---
title: "Biblioteka e niveleve"
parent: "Nivelet dhe gjeometria e sfondit"
nav_order: 4
lang: "sq"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Biblioteka e niveleve

Biblioteka mban nivelet e tua në këtë shfletues, që të mos i ngarkosh dhe thjeshtosh përsëri. **Pastrimi i të dhënave të faqes në shfletues e fshin bibliotekën, dhe nuk ka eksport.** Mbaj skedarët e tu origjinalë.

Përpunimi i një niveli - analizimi, klasifikimi, bashkimi, zvogëlimi, paketimi i teksturave - është i ngadaltë, dhe rezultati është gjithmonë i njëjtë. **Biblioteka** në fund të panelit Sfondi / nivel mban nivelet e përpunuara në këtë shfletues, kështu që një rrjetë e zvogëluar nuk ndërtohet kurrë dy herë ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Ruaj dhe rihap një nivel {#save-and-reload-a-level}

1. Ngarko një imazh harte ose një model 3D dhe kontrollo që duket i saktë.
2. Shtyp **Ruaj në bibliotekë**. Paneli thotë *Ruajtur. Do të ngarkohet menjëherë herën tjetër.*
3. Herën tjetër, hap listën **Biblioteka** dhe shtyp ▸ te niveli.
4. Shtyp ✕ për të fshirë një hyrje që nuk të duhet më.

## Përdorimi {#using-it}

| Kontrolli | Efekti |
|---|---|
| **Ruaj në bibliotekë** | Ruan nivelin aktual. Një imazh harte ruhet si PNG me dy ankorat e vet; një model si buffer-at e tij të përpunuar. Paneli thotë *Ruajtur. Do të ngarkohet menjëherë herën tjetër.* |
| Lista e bibliotekës | Një rresht për çdo nivel të ruajtur: emri (me madhësinë e ruajtur kur kalon miun), trekëndëshat për një model ose gjerësia në piksele për një imazh. |
| ▸ (*Ngarko*) | Ngarkon hyrjen si nivelin aktual. |
| ✕ (*Fshi*) | Heq hyrjen. |
| Rreshti i përdorimit | `Using X of Y.` - vlerësimi i shfletuesit për hapësirën e ruajtjes së këtij sajti. |

Kur nuk ka asgjë të ruajtur, lista thotë *Empty. Load a map or model, then "Save to library".*

## Çfarë ruhet {#what-is-stored}

| Lloji | Ruhet | Nuk ruhet |
|---|---|---|
| Imazh harte | Imazhi (PNG), madhësia e tij, ankorat e tij | Lartësia, kthimi horizontal, errësimi, ndriçimi, heqja e ngjyrës - rikthehen në parazgjedhjet (lartësia = Y-ja më e ulët e grupit aktual të dhënave, kthimi horizontal i aktivizuar) |
| Nivel 3D | Kulmet, ngjyrat e kulmeve, koordinatat e teksturës, pllakat e tyre dhe atlasi i teksturës, trekëndëshat e tokës / strukturave / ujit, skajet e strukturave, numrat e trekëndëshave | Emrat e pjesëve dhe arsyet e klasifikimit, dhe çdo cilësim pamjeje - rikthehen në parazgjedhjet e një importi të ri |

Një model i ngarkuar nga biblioteka nuk ka listë pjesësh, dhe kufijtë e tij dhe brezi i lartësisë së tokës llogariten sërish nga kulmet e tij.

## Ku jeton {#where-it-lives}

Në IndexedDB të shfletuesit, baza `3dheat`, magazina e objekteve `levels`, për origjinën e faqes (adresa në shiritin e adresave të shfletuesit). Është lokale për atë profil shfletuesi: një shfletues tjetër, një profil tjetër ose një adresë tjetër (për shembull `localhost` në vend të `127.0.0.1`) sheh një bibliotekë tjetër, bosh. Pastrimi i të dhënave të sajtit në shfletues e fshin atë. Hyrjet e ruajtura nga versionet e vjetra pa struktura, ngjyra ose ujë ngarkohen gjithsesi.
