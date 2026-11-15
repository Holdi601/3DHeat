---
title: "Cronologie și redare"
nav_order: 5
lang: "ro"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Cronologie și redare

Bara de sub imagine este ca un player video: poți reda datele ca pe un film, le poți pune pe pauză, sări prin ele și schimba viteza.

![Bara cronologiei: 1 Toate/Redare, 2 butoanele de transport, 3 ceasul, 4 Viteză, 5 Istoric, cu Fereastră și un Interval de 30 s](../assets/img/en/timeline-bar.webp)

Bara de sub vizualizare este cronologia ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Ea decide ce rânduri sunt vizibile în orice moment. Are nevoie de o coloană de timp; fără ea, toată bara este dezactivată, vizualizarea rămâne în modul **Toate**, iar bara laterală spune *Nu există coloană de timp în aceste date - cronologia este dezactivată și fiecare punct de date se arată deodată.*

## Toate și Redare {#all-and-play}

Două moduri de bază, pentru că răspund la întrebări diferite.

- **Toate** (implicit la fiecare încărcare) ignoră complet cursorul de redare și arată fiecare rând care trece prin filtre. Este vizualizarea „unde se întâmplă asta” și nu este același lucru cu a derula până la capăt. Derularea este dezactivată, iar ceasul afișează `toate · <interval> din date`.
- **Redare** rulează datele ca o accelerare de timp. Apar derularea, comenzile de transport și setările istoricului.

Alegerea **Toate** oprește și redarea.

## Comenzile {#the-controls}

| Comandă | Implicit | Înseamnă |
|---|---|---|
| Derulare | începutul | Cursorul de redare. Trage ca să mergi la un moment; 20.000 de pași pe întregul interval. |
| **Toate** / **Redare** | Toate | Vezi mai sus. |
| ▶ / ❚❚ | pus pe pauză | Pornește sau oprește redarea; și `K`. |
| ◀ **Redă înapoi (J)** | | Redă datele invers. Apare doar în modul **Figuri suprapuse**; același tasta `J` funcționează și acolo (vezi [Tastatură](#keyboard)). |
| ⏮ | | Înapoi la începutul intervalului. |
| Ceas | | `scurs / total` ca `mm:ss.s` (sau `h:mm:ss`) și, când coloana de timp este un marcaj absolut, ora din zi a cursorului ca `HH:MM:SSZ` (UTC). |
| **Viteză** | 1× | Secunde din date pe secundă reală. Meniul are 17 trepte de la 0,01× la 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), plus **Personalizată…**: scrie orice viteză între 0,001× și 3600× (de exemplu 0,3 sau 12) și apasă Enter; Esc păstrează viteza curentă. Ultima viteză se reține pentru următoarea vizită (vezi [Setările salvate](ref-settings-storage.md)). |
| **Istoric** | Cumulativ | Ce se consideră vizibil la cursor: *Cumulativ*, *Fereastră* sau *Durată de viață* (mai jos). |
| **Interval** (Fereastră; în modul Linii și Durată de viață) | 30 s | Lungimea ferestrei care se termină la cursor; cel puțin 0,01 s. În [Căldură pe linii](line-heat.md#playback) este lungimea cozii. |
| **Durată de rezervă** (doar Durată de viață, nu în modul Linii) | 10 s | Cât timp rămâne vizibil un punct de date care nu are un următor eșantion al persoanei lui. |
| **Estompare** (doar Durată de viață, nu în modul Linii) | 0,4 | Fracțiunea din durata de viață a fiecărui punct în care se estompează, între 0 și 1. |
| **Buclă** | pornit | La final, o ia de la capăt; oprit se oprește la final. |
| Dreapta | | Numele setului de date. |

**Intervalul** este durata în timp a setului de date - sau, în [suprapunerea figurilor](box-replay.md) cu o sesiune aleasă, durata acelei sesiuni.

## Istoric {#history}

În modul Redare:

- **Cumulativ** - tot ce s-a întâmplat de la începutul intervalului până la cursor. Căldura se acumulează pe măsură ce se redă.
- **Fereastră** - un interval fix de istoric care se termină la cursor (*Interval*).
- **Durată de viață** - fiecare punct de date trăiește până la **următorul eșantion al aceleiași persoane** (în aceeași sesiune), astfel că exact o poziție pe persoană este curentă în orice moment. Un punct de date a cărui persoană nu mai apare - o moarte, o deconectare, sfârșitul jurnalului - nu are un următor eșantion și trăiește cât *Durata de rezervă*, în loc să dispară imediat sau să persiste la nesfârșit. Punctele de date se **estompează** în ultima fracțiune *Estompare* din viața lor, în loc să dispară brusc: cu câte un eșantion activ pe persoană, un punct care dispare între un cadru și următorul face întregul câmp să clipească la rata eșantioanelor. *Estompare* 0 readuce tăierea bruscă.

Durata de viață cere și o coloană de persoană, pe lângă cea de timp; fără ea, istoricul revine la Cumulativ la încărcare. În [Căldură pe linii](line-heat.md#playback) istoricul stabilește cât timp rămâne vizibilă coada unui traseu; în [suprapunerea figurilor](box-replay.md) *Durata de rezervă* este cât timp este ținută o persoană fără alte eșantioane.

## Comportamentul redării {#playback-behaviour}

Din bucla de cadre ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Cursorul avansează cu *timpul cadrului × viteza*. Timpul cadrului este limitat la 0,1 s, deci schimbarea filei nu teleportează cursorul.
- Apăsarea pe redare chiar la finalul intervalului pornește de la început, ca un player media. La fiecare încărcare cursorul este așezat la început, deci prima apăsare pe redare chiar redă.
- La finalul intervalului cursorul sare înapoi la început (Buclă pornit) sau se oprește acolo și redarea se termină (Buclă oprit).
- Derularea citește direct cursorul motorului la fiecare cadru; starea aplicației se actualizează la salturi, porniri, opriri și bucle.
- Alegerea unei sesiuni în selectorul de sesiune duce cursorul la începutul acelei sesiuni.

## De ce redarea este fluidă și ieftină {#why-playback-is-smooth-and-cheap}

Rândurile sunt păstrate sortate după timp, deci o fereastră de timp înseamnă două căutări binare pe coloana de timp: avansarea cursorului mută două numere întregi și nu atinge niciun rând, iar costul redării urmărește numărul de rânduri din fereastră, nu mărimea setului de date.

Cum rămâne căldura stabilă cât timp fereastra se mișcă depinde de istoric ([Acumulare](accumulation.md)):

- **Cumulativ** doar crește, deci fiecare cadru adaugă doar rândurile care au devenit vizibile de la ultimul cadru, cu greutate deplină. Câmpul se construiește monoton, iar pauza nu schimbă nimic, pentru că nu mai rămâne nimic de sosit. (Reestimarea ar face ca fiecare cadru să aprindă o submulțime aleatoare diferită și apoi să o estompeze, ceea ce se citește ca izbucniri care strălucesc și dispar.)
- **Fereastră** și **Durată de viață** chiar se schimbă la fiecare cadru și sunt reestimate, amestecate ca o medie mobilă exponențială (greutate 0,34 pentru cadrul nou), care este nepărtinitoare în regim staționar și mult mai liniștită decât o pornire de la zero.
- În modul Durată de viață, rândurile candidate sunt cele din *cursor - max(cel mai lung gol din date, Durata de rezervă)* până la cursor; apoi shader-ul elimină fiecare rând a cărui viață proprie s-a încheiat și aplică estomparea.

Trecerea între Toate și Redare sau schimbarea istoricului repornește acumularea.

## Tastatură {#keyboard}

| Tastă | Efect |
|---|---|
| `K` | Redare / pauză |
| `J` | Redă înapoi; apăsată din nou pune pe pauză (doar Figuri suprapuse) |
| `L` | Redă înainte; apăsată din nou pune pe pauză (doar Figuri suprapuse) |

`J` și `L` trec și cronologia pe **Redare**. Tastele sunt ignorate cât timp un câmp de text sau un meniu are focusul. În fila Analiză de cursă, `K` acționează asupra propriei reluări a filei.
