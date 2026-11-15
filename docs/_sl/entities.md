---
title: "Entitete"
parent: "Filtri in orodja"
nav_order: 3
lang: "sl"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entitete

**Entitete** vam omogočajo, da izberete enega igralca (ali nekaj njih) in vidite samo, kam je ta igralec šel. Uporabite jo, da sledite svojemu gibanju ali enemu nasprotniku.

Plošča se prikaže, kadar ima podatkovna množica stolpec osebe. Njena glava kaže število oseb ali `izbrano od skupaj`, medtem ko je izbor aktiven (*oseba* je en igralec ali AI, glejte [slovar](glossary.md)).

## Izberite igralca {#pick-a-player}

1. V stranski vrstici odprite **Entitete**.
2. V iskalno polje vpišite del imena.
3. Obkljukajte igralca. Glava pokaže na primer `2 od 10`, vse drugo izgine.
4. **Počisti** spet pokaže vse.

![Entitete z dvema od desetih igralcev izbranima](../assets/img/en/entities-selected.webp)

Izbor v načinih toplote (točke, črte, razlika, toplota ekip) kot tudi v sledeh, figurah in sledeh [prekrivanja figur](box-replay.md) prikaže samo izbrane osebe. Če ga pustite prazen, so prikazani vsi; izbira vseh je isto kot izbira nikogar.

## Plošča {#the-panel}

| Del | Pomen |
|---|---|
| Iskalno polje | *Išči N entitet...* – filtrira seznam po podnizu imena, neodvisno od velikosti črk. Prikaže `N zadetkov` ali `N zadetkov, prikazujem prvih 200`; *Nič ne ustreza »...«*, kadar iskanje ne najde ničesar. |
| Seznam | Do 200 oseb (prvih 200 ujemajočih), vsaka s potrditvenim poljem, vzorcem barve osebe in imenom (*(brez imena)* za prazno ime). |
| Namig »v igri« | Ko čas teče, seznam vsebuje tiste, *v igri na predvajalni glavi*; iskanje najde vse. |
| **AI (n)** | Zložljiva skupina, ki vsebuje enote, ki jih vodi AI, ločeno od igralcev. |
| **Dodaj prikazane** | Doda vse trenutno navedene v izbor. |
| **Samo prikazane** | Naredi izbor točno iz navedenih. |
| **Počisti** | Izprazni izbor. |

## Omejitve {#limits}

V toploti je izbor filter in uporabi eno od štirih [rež filtrov](filters.md#rules). Ko drugi filtri že uporabljajo vse štiri, plošča pove *Ni uporabljeno za toploto: vse reže filtrov so zasedene. Prekrivni prikaz figur še vedno kaže samo te entitete. Počistite filter pod Filtri, da sprostite režo.* Počistite filter, da sprostite režo.

Izbor se počisti ob vsaki novi podatkovni množici. Zavihek Tekma nastavi isti izbor, ko se osredotoči na enega igralca.

## Za razvijalce {#for-developers}

Izbor je shranjen kot filter *persons* ([Filtri](filters.md#for-developers)). Maska senčilnika drži 65.536 id-jev oseb; oseba čez to ni narisana v toploti, dokler je izbor aktiven.
