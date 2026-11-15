---
title: "Figuri"
parent: "Reluare"
nav_order: 3
has_children: true
lang: "ro"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figuri

O **figură** este un model 3D mic a ceea ce este de fapt o unitate: un tanc, un avion de luptă, o navă, un soldat. [Redarea](match-replay.md) desenează fiecare unitate ca figura ei, la mărime reală, în loc de o casetă simplă.

Există aproximativ 2.000 de vehicule, aeronave, nave, arme și soldați cu nume, toate construite de vizualizator însuși.

![Tancurile din demo desenate ca propriile lor figuri](../assets/img/ro/replay-tanks.webp)

## Ce este în catalog {#what-is-in-the-catalogue}

| Domeniu | Exemple |
|---|---|
| Oameni | soldat în picioare, ghemuit, întins; lunetist, antitanc, medic, echipaj |
| Sol | tancuri, vehicule de luptă pentru infanterie, apărare antiaeriană, artilerie, camioane și mașini, trenuri și tramvaie |
| Aer | avioane de vânătoare, avioane de atac, bombardiere, transporturi, elicoptere, de la biplane până la avioane moderne |
| Mare | nave de luptă pe clase, portavioane, submarine, bărci, nave comerciale |
| Arme | rachete, rachete propulsate, bombe, torpile, fuzeie și capcane radar |
| Marcaje | fumigene, grenade cu flacără și cu foc, bombe amplasate, steaguri, puncte de apariție, puncte de traseu |

## Cum sunt făcute figurile {#how-the-figures-are-made}

- **Construite din dimensiuni publicate.** Majoritatea figurilor sunt făcute de constructorul de figuri al vizualizatorului din numere publice: lungime, lățime, înălțime, roți de drum, turelă și tun, aripi și coadă. Forma lor este apoi ajustată după fotografii publice, desene și dimensiuni publicate. Nu se folosesc modelele niciunui joc.
- **Modele gratuite.** Câteva figuri folosesc modele 3D gratuite (CC0 sau CC BY) acolo unde sunt mai fidele, uneori combinate cu caroseria construită. Autorii lucrărilor CC BY sunt menționați la [Mențiuni pentru figuri](figure-credits.md); lucrările CC0 nu cer mențiune și nu sunt listate acolo.
- Fiecare figură are o versiune completă, una grosieră și una de la distanță (niveluri de detaliu, LOD), ca să poată fi desenate mii deodată.

## Ce figură primește o unitate {#which-figure-a-unit-gets}

Vizualizatorul se uită la coloanele proprii ale datelor:

1. **Nume** - coloanele numite *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* sau *Figure* - sunt potrivite cu catalogul: exact, prin aproximativ 4.000 de aliasuri (id-uri de unități ale mai multor jocuri), prin cel mai lung început cunoscut (`F-16C_50` este F-16C) sau prin cel mai scurt nume de figură care începe cu el.
2. Un nume a cărui figură nu se potrivește cu **tipul** unității nu este folosit (un camion numit *Typhoon* nu este avionul de vânătoare).
3. **Tipurile** - coloanele numite *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* sau *Domain* - dau o figură de clasă: etichetele Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), pictogramele de hartă sau cuvinte simple (tank, elicopter, infanterie).
4. Datele fără niciunul dintre ele sunt date despre oameni: toată lumea este soldat.

Deci cel mai ușor mod de a obține figurile corecte este o coloană `vehicle` cu numele reale, sau o coloană `type` cu etichete Tacview.

**Unitatea mea apare ca o casetă sau ca un soldat.** Adaugă o coloană `vehicle` cu numele real, sau o coloană `type` cu o etichetă Tacview. Treci cu cursorul peste unitate ca să vezi ce nume a fost potrivit. Datele care au asemenea coloane, dar nu spun nimic despre o unitate, o lasă casetă; datele fără niciuna sunt desenate ca soldați.

## Setări {#settings}

Secțiunea **Figuri** din bara laterală a redării stabilește mărimea, cea mai mică mărime pe ecran, ce devin unitățile îndepărtate (figură, săgeată, simbol) și efectele desenate pe ele. Vezi [Redarea meciului](match-replay.md#figures). Fumul, focul și alte efecte cu durată: [Figuri în suprapunerea de figuri](figure-replay.md).

## Un pachet local opțional de figuri {#an-optional-local-figure-pack}

Poți păstra un pachet opțional de figuri proprii pe propriul calculator. Figurile lui iau locul figurilor din catalog cu aceleași nume. Nu face niciodată parte din depozit sau dintr-un build publicat; fără el, nimic nu se schimbă.
