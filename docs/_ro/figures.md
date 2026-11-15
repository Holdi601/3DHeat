---
title: "Figuri"
parent: "Replay"
nav_order: 3
has_children: true
lang: "ro"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: true
---

# Figuri

O **figură** este un mic model 3D a ceea ce este de fapt o unitate: un tanc, un avion cu reacție, o navă, un soldat. [Reluarea](match-replay.md) desenează fiecare unitate ca figura ei, la mărimea reală, în loc de o cutie simplă.

Există circa 2.000 de vehicule, aeronave, nave, arme și soldați cu nume, toate construite chiar de vizualizator.

![Tancurile din demonstrație desenate ca figuri proprii](../assets/img/ro/replay-tanks.webp)

## Ce conține catalogul {#what-is-in-the-catalogue}

| Domeniu | Exemple |
|---|---|
| Oameni | soldat în picioare, ghemuit, întins; lunetist, anti-tanc, sanitar, echipaj |
| Sol | tancuri, vehicule de luptă ale infanteriei, apărare aeriană, artilerie, camioane și mașini, trenuri și tramvaie |
| Aer | avioane de vânătoare, avioane de atac, bombardiere, transport, elicoptere, de la biplane la avioane cu reacție moderne |
| Mare | nave de război pe clase, portavioane, submarine, bărci, nave comerciale |
| Arme | rachete, rachete ghidate, bombe, torpile, flare-uri și cioburi de radar |
| Marcaje | grenade cu fum, lumină și foc, bombe plantate, steaguri, spawnuri, puncte de traseu |

## Cum sunt făcute figurile {#how-the-figures-are-made}

- **Construite din dimensiuni publicate.** Majoritatea figurilor sunt făcute de constructorul de figuri al vizualizatorului din cifre publice: lungime, lățime, înălțime, roți, turelă și tun, aripi și coadă. Forma lor este apoi reglată după fotografii publice, desene și dimensiuni publicate. Nu se folosesc modelele niciunui joc.
- **Modele libere.** Câteva figuri folosesc modele 3D libere (CC0 sau CC BY) acolo unde sunt mai fidele, uneori combinate cu corpul construit. Autorii lucrărilor CC BY sunt menționați în [Creditele figurilor](figure-credits.md); lucrările CC0 nu cer mențiune și nu sunt listate acolo.
- Fiecare figură are o versiune completă, una grosieră și una îndepărtată (niveluri de detaliu, LOD), astfel că mii pot fi desenate deodată.

## Ce figură primește o unitate {#which-figure-a-unit-gets}

Vizualizatorul se uită la coloanele proprii ale datelor:

1. **Nume** - coloanele numite *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* sau *Figure* - sunt potrivite cu catalogul: exact, prin circa 4.000 de alias (identificatorii de unități din mai multe jocuri), prin cel mai lung început cunoscut (`F-16C_50` este F-16C), sau prin cel mai scurt nume de figură care începe cu el.
2. Un nume a cărui figură nu se potrivește cu **tipul** unității nu este folosit (un camion numit *Typhoon* nu este avionul de vânătoare).
3. **Tipuri** - coloanele numite *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* sau *Domain* - dau o figură de clasă: etichete Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), pictograme de hartă sau cuvinte simple (tank, helicopter, infantry).
4. Datele fără niciuna sunt date despre oameni: fiecare este un soldat.

Deci cel mai ușor mod de a obține figurile corecte este o coloană `vehicle` cu numele reale, sau o coloană `type` cu etichete Tacview.

**Unitatea mea apare ca o cutie sau ca un soldat.** Adaugă o coloană `vehicle` cu numele real sau o coloană `type` cu o etichetă Tacview. Treci cu cursorul peste unitate ca să vezi ce nume a fost potrivit. Datele care au astfel de coloane, dar nu spun nimic despre o unitate, o lasă cutie; datele fără niciuna sunt desenate ca soldați.

## Setări {#settings}

Secțiunea **Figuri** din bara laterală a reluării stabilește mărimea, cea mai mică mărime pe ecran, ce devin unitățile îndepărtate (figură, săgeată, simbol) și efectele desenate pe ele. Vezi [Reluarea meciului](match-replay.md#figures). Fum, incendiu și alte efecte cu durată: [Figuri în suprapunerea figurilor](figure-replay.md).

## Un pachet local opțional de figuri {#an-optional-local-figure-pack}

Poți păstra pe calculatorul tău un pachet opțional de figuri proprii. Figurile lui iau locul figurilor din catalog cu aceleași nume. Nu face niciodată parte din depozit sau dintr-o versiune publicată; fără el, nimic nu se schimbă.
