---
title: "Časovnica in predvajanje"
nav_order: 5
lang: "sl"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Časovnica in predvajanje

Vrstica pod sliko je kot videopredvajalnik: podatke lahko predvajate kot film, ustavite, skočite naokoli in spremenite hitrost.

![Vrstica časovnice: 1 Vse/Predvaj, 2 gumbi za predvajanje, 3 ura, 4 Hitrost, 5 Zgodovina, z Okno in Razponom 30 s](../assets/img/en/timeline-bar.webp)

Vrstica pod pogledom je časovnica ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Odloča, katere vrstice so kadarkoli vidne. Potrebuje stolpec s časom; brez njega je celotna vrstica onemogočena, pogled ostane v načinu **Vse**, stranska vrstica pa pove *V teh podatkih ni stolpca s časom - časovnica je onemogočena in vsaka točka je prikazana naenkrat.*

## Vse in Predvaj {#all-and-play}

Dva glavna načina, ker odgovarjata na različni vprašanji.

- **Vse** (privzeto ob vsakem nalaganju) popolnoma prezre glavo predvajanja in prikaže vsako vrstico, ki prestane filtre. Je pogled »kje se to dogaja«, ni isto kot pomik na konec. Drsnik je onemogočen, ura pa kaže `vse · <razpon> podatkov`.
- **Predvaj** predvaja podatke kot hitri posnetek. Pojavijo se drsnik, kontrole predvajanja in nastavitve zgodovine.

Izbira **Vse** tudi ustavi predvajanje.

## Kontrole {#the-controls}

| Kontrola | Privzeto | Pomen |
|---|---|---|
| Drsnik | začetek | Glava predvajanja. Povlecite za iskanje; 20.000 korakov čez obseg. |
| **Vse** / **Predvaj** | Vse | Glejte zgoraj. |
| ▶ / ❚❚ | ustavljeno | Predvajaj ali ustavi; tudi `K`. |
| ◀ **Predvajaj nazaj (J)** | | Predvaja podatke v obratnem vrstnem redu. Prikazano le v načinu **Prekrivanje figur**; enaka tipka `J` deluje tudi tam (glejte [Tipkovnica](#keyboard)). |
| ⏮ | | Nazaj na začetek obsega. |
| Ura | | `pretečeno / skupaj` kot `mm:ss.s` (ali `h:mm:ss`) in, kadar je stolpec s časom absolutna časovna oznaka, zidna ura glave predvajanja kot `HH:MM:SSZ` (UTC). |
| **Hitrost** | 1× | Sekunde podatkov na realno sekundo. Meni ima 17 korakov od 0,01× do 1800× (0,01; 0,02; 0,05; 0,1; 0,25; 0,5; 1; 2; 4; 8; 16; 32; 64; 128; 256; 600; 1800), plus **Po meri…**: vpišite poljubno hitrost od 0,001× do 3600× (na primer 0,3 ali 12) in pritisnite Enter; Esc ohrani trenutno hitrost. Zadnja hitrost se zapomni za naslednji obisk (glejte [Shranjene nastavitve](ref-settings-storage.md)). |
| **Zgodovina** | Kumulativno | Kaj šteje za vidno pri glavi predvajanja: *Kumulativno*, *Okno* ali *Življenjska doba* (spodaj). |
| **Razpon** (Okno; v načinu Črte tudi Življenjska doba) | 30 s | Dolžina okna, ki se konča pri glavi predvajanja; vsaj 0,01 s. V [Črtni toploti](line-heat.md#playback) je to dolžina repa. |
| **Nadomestna življenjska doba** (samo Življenjska doba, ne v načinu Črte) | 10 s | Kako dolgo ostane vidna točka podatkov, ki nima naslednjega vzorca svoje osebe. |
| **Pojemanje** (samo Življenjska doba, ne v načinu Črte) | 0,4 | Delež življenjske dobe vsake točke, porabljen za bledenje, 0-1. |
| **Ponavljaj** | vklopljeno | Ob koncu se začne znova; izklopljeno se ustavi ob koncu. |
| Desna stran | | Ime nabora podatkov. |

**Obseg** je časovni razpon nabora podatkov - ali, v [prekrivanju figur](box-replay.md), ko je izbrana seja, razpon te seje.

## Zgodovina {#history}

V načinu Predvaj:

- **Kumulativno** - vse od začetka obsega do glave predvajanja. Toplota se gradi, ko se predvaja.
- **Okno** - fiksen razpon zgodovine, ki se konča pri glavi predvajanja (*Razpon*).
- **Življenjska doba** - vsaka točka živi, dokler ne pride **naslednji vzorec iste osebe** (v isti seji), zato je ob vsakem trenutku aktualna natanko ena pozicija na osebo. Točka, katere oseba se nikoli več ne pojavi - smrt, odklop, konec dnevnika - nima naslednjega vzorca in živi *Nadomestno življenjsko dobo*, namesto da bi takoj izginila ali za vedno ostala. Točke se **pojemajo** v zadnjem deležu *Pojemanja* svoje življenjske dobe, namesto da bi izginile naenkrat: ko je en vzorec na osebo aktiven, točka, ki med dvema okvirjema izgine, povzroči utripanje celotnega polja s hitrostjo vzorčenja. *Pojemanje* 0 povrne trdo rezanje.

Življenjska doba potrebuje stolpec osebe in stolpec časa; brez stolpca osebe zgodovina ob nalaganju preklopi na Kumulativno. V [Črtni toploti](line-heat.md#playback) zgodovina določa, kako dolgo ostane vidan rep poti; v [prekrivanju figur](box-replay.md) je *Nadomestna življenjska doba* čas, za katerega ostane osebo brez nadaljnjih vzorcev.

## Vedenje predvajanja {#playback-behaviour}

Iz zanke okvirjev ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Glava predvajanja napreduje za *čas okvirja × hitrost*. Čas okvirja je omejen na 0,1 s, zato menjava zavihkov ne teleportira glave predvajanja.
- Pritisk na predvajanje na samem koncu obsega začne od začetka, kot to naredi medijski predvajalnik. Ob vsakem nalaganju je glava parkirana na začetku, zato prvi pritisk na predvajanje predvaja.
- Ob koncu obsega glava skoči nazaj na začetek (Ponavljaj vklopljeno) ali se tam ustavi in predvajanje konča (Ponavljaj izklopljeno).
- Drsnik vsak okvir bere glavo predvajanja neposredno iz motorja; stanje aplikacije se posodobi ob iskanju, zagonih, ustavitvah in ponovitvah.
- Izbira seje v izbirniku seje premakne na začetek te seje.

## Zakaj je predvajanje gladko in poceni {#why-playback-is-smooth-and-cheap}

Vrstice so shranjene urejene po času, zato je časovno okno dve binarni iskanji po stolpcu časa: premikanje glave predvajanja premakne dve celi števili in se ne dotakne nobene vrstice; strošek predvajanja sledi številu vrstic v oknu, ne velikosti nabora podatkov.

Kako se toplota ohrani stabilna, medtem ko se okno premika, je odvisno od zgodovine ([Kopičenje](accumulation.md)):

- **Kumulativno** samo raste, zato vsak okvir doda le vrstice, ki so postale vidne od zadnjega, s polno težo. Polje se gradi monotono in ustavitev ničesar ne spremeni, ker ni ostalo ničesar, kar bi moralo priti. (Ponovna ocena bi vsak okvir osvetlila drugo naključno podmnožico in jo nato zbledela, kar bi videti kot izbruhi, ki se zablisnejo in izginejo.)
- **Okno** in **Življenjska doba** se res spreminjata vsak okvir in se ponovno ocenjujeta, zmešani kot eksponentno drseče povprečje (utež 0,34 za nov okvir), kar je v stabilnem stanju nepristransko in veliko mirnejše kot začeti znova.
- V načinu Življenjska doba so kandidatne vrstice tiste od *glava predvajanja − max(najdaljša vrzel v podatkih, Nadomestna življenjska doba)* do glave predvajanja; senčilnik nato izpusti vsako vrstico, katere življenjska doba se je končala, in uporabi pojemanje.

Preklop med Vse in Predvaj ali sprememba zgodovine ponovno zažene kopičenje.

## Tipkovnica {#keyboard}

| Tipka | Učinek |
|---|---|
| `K` | Predvajaj / ustavi |
| `J` | Predvajaj nazaj; ponoven pritisk ustavi (samo Prekrivanje figur) |
| `L` | Predvajaj naprej; ponoven pritisk ustavi (samo Prekrivanje figur) |

`J` in `L` tudi preklopita časovnico na **Predvaj**. Tipke so ignorirane, medtem ko ima fokus besedilno polje ali meni. V zavihku Analiza dirke `K` upravlja predvajanje tega zavihka.
