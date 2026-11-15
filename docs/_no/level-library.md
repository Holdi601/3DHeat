---
title: "Banebibliotek"
parent: "Baner og bakgrunnsgeometri"
nav_order: 4
lang: "no"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Nivåbiblioteket

Biblioteket holder nivåene dine i denne nettleseren, så du ikke trenger å laste dem inn og forenkle dem på nytt. **Å tømme nettstedets data i nettleseren sletter biblioteket, og det finnes ingen eksport.** Ta vare på de opprinnelige filene dine.

Å behandle et nivå - lese, klassifisere, sveise, redusere, pakke teksturer - er tregt, og resultatet er det samme hver gang. **Biblioteket** nederst i panelet Bakgrunn / nivå holder behandlede nivåer i denne nettleseren, så et redusert nett aldri bygges to ganger ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Lagre og last inn et nivå igjen {#save-and-reload-a-level}

1. Last inn et kartbilde eller en 3D-modell, og sjekk at den ser riktig ut.
2. Trykk **Lagre i biblioteket**. Panelet sier *Lagret. Den lastes med én gang neste gang.*
3. Neste gang åpner du listen **Bibliotek** og trykker ▸ på nivået.
4. Trykk ✕ for å slette et innslag du ikke trenger lenger.

## Slik bruker du det {#using-it}

| Kontroll | Effekt |
|---|---|
| **Lagre i biblioteket** | Lagrer det gjeldende nivået. Et kartbilde lagres som en PNG med sine to ankere; en modell som sine behandlede buffere. Panelet sier *Lagret. Den lastes med én gang neste gang.* |
| Bibliotekslisten | Én rad per lagret nivå: navn (med den lagrede størrelsen ved å holde musen over), trekanter for en modell eller bredde i piksler for et bilde. |
| ▸ (*Last inn*) | Laster innslaget som gjeldende nivå. |
| ✕ (*Slett*) | Fjerner innslaget. |
| Bruksrad | `Bruker X av Y.` - nettleserens lagringsanslag for dette nettstedet. |

Uten noe lagret sier listen *Tom. Last inn et kart eller en modell, og trykk "Lagre i biblioteket".*

## Hva som lagres {#what-is-stored}

| Type | Lagret | Ikke lagret |
|---|---|---|
| Kartbilde | Bildet (PNG), størrelsen, ankerne | Høyde, speiling, opasitet, lysstyrke, avmetning - tilbakestilt til standardverdiene (høyde = gjeldende datasetts laveste Y, speiling på) |
| 3D-nivå | Hjørnepunkter, hjørnefarger, teksturkoordinater, deres fliser og teksturatlaset, trekanter for bakke / konstruksjon / vann, kanter på konstruksjoner, antall trekanter | Delnavn og klassifiseringsgrunner, og alle utseendeinnstillinger - tilbakestilt til standardverdiene for en ny import |

En modell lastet fra biblioteket har ingen delliste, og grensene og høydebåndet for bakken beregnes på nytt fra hjørnepunktene.

## Hvor det ligger {#where-it-lives}

I nettleserens IndexedDB, database `3dheat`, objektlager `levels`, for sidens opprinnelse (adressen i nettleserens adressefelt). Det er lokalt for den nettleserprofilen: en annen nettleser, en annen profil eller en annen adresse (for eksempel `localhost` i stedet for `127.0.0.1`) ser et annet, tomt bibliotek. Å tømme nettstedets data i nettleseren sletter det. Innslag lagret av eldre versjoner uten konstruksjoner, farger eller vann lastes fortsatt.
