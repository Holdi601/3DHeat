---
title: "Moduri de căldură"
nav_order: 4
has_children: true
lang: "ro"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Moduri de căldură

Fiecare punct adaugă o mică strălucire, strălucirile se adună, iar grămada este colorată. Modurile sunt cinci feluri de a o colora, iar fiecare răspunde la o întrebare.

Bara de moduri din partea de sus a barei laterale a filei Hartă termică alege cum se desenează [setul de date](glossary.md). Tastele 1-4 aleg Căldură, Diferență, Căldură pe echipe și Linii. Suprapunerea figurilor nu are tastă.

![Bara de moduri cu Căldură, Diferență, Căldură pe echipe, Figuri suprapuse și Linii](../assets/img/en/heat-modes-bar.webp)

| Mod | Întrebarea la care răspunde |
|---|---|
| **Căldură** | Unde s-a întâmplat și cât de mult? |
| **Diferență** | Care parte a făcut mai mult? |
| **Căldură pe echipe** | A cui a fost? |
| **Linii** | Pe unde au mers oamenii? |
| **Figuri suprapuse** | Cine a fost unde și când? |

![Aceleași date în patru moduri: Căldură, Diferență, Căldură pe echipe și Linii](../assets/img/en/heat-modes-grid.webp)

| Mod (eticheta din bară) | Tastă | Ce desenează | Are nevoie de |
|---|---|---|---|
| **Căldură** | 1 | Densitate aditivă: fiecare rând vizibil adaugă un sprite radial orientat spre cameră. [Căldură](heat.md) | un set de date |
| **Diferență** | 2 | Densitate cu semn: o populație adună, alta scade. [Diferență](difference.md) | două părți: cel puțin două grupuri sau o împărțire după o coloană păstrată |
| **Căldură pe echipe** | 3 | Densitate colorată după grup: o nuanță pentru fiecare grup, amestecată acolo unde grupurile se suprapun. [Căldură pe echipe](team-heat.md) | o coloană de grup |
| **Figuri suprapuse** | - | O figură (sau o cutie) pentru fiecare persoană, care se mișcă pe cronologie: reluarea. [Suprapunerea figurilor](box-replay.md), [Reluarea meciului](match-replay.md) | o coloană de persoană |
| **Linii** | 4 | Căldură pe linii: o linie de la fiecare eșantion al unei persoane până la următorul, cu căldura care scade lateral. [Căldură pe linii](line-heat.md) | o coloană de persoană și una de timp |

Un mod pe care datele nu-l pot susține apare estompat, iar sfatul lui spune de ce, de exemplu *Indisponibil - modul Diferență are nevoie de două grupuri sau de o coloană păstrată după care să împartă; aceste date au un singur grup.* Când un set de date nou nu poate susține modul curent, vizualizarea trece la **Căldură**.

Tastele 1-4 sunt verificate la fel față de date: o tastă pentru un mod estompat nu face nimic.

## Ce panouri arată fiecare mod {#which-panels-each-mode-shows}

| Panou | Căldură | Diferență | Căldură pe echipe | Figuri suprapuse | Linii |
|---|---|---|---|---|---|
| Trasee ([căldură pe linii](line-heat.md)) | | | | | da |
| Forma căldurii (cu **Urmărește vederea** și **Aceeași densitate la orice zoom**), Culorile căldurii, Limitele de pixeli ale sprite-ului, Adâncime, Eliminare după distanță | da | da | da | | da |
| Direcție ([căldură direcțională](directional-heat.md)), Valoare ([ponderarea valorilor](value-weighting.md)) | da | da | da | | da |
| Vizualizarea echipelor ([suprapunerea figurilor](box-replay.md)) | | | | da | |
| Împărțirea pentru diferență ([diferență](difference.md)) | | da | | | |
| [Echipe](teams-list.md), [Entități](entities.md), [Filtre](filters.md), Fundal / nivel, [Secțiune](slice.md), [Măsurare](measure.md), Traseu cameră și randare, Performanță, Cameră și scenă | da | da | da | da | da |

## Ce au în comun toate modurile de căldură {#what-every-heat-mode-shares}

Toate cele patru moduri de căldură (tot ce nu este suprapunerea figurilor) sunt aceeași mașinărie cu intrări diferite ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Ce rânduri.** [Fereastra cronologiei](timeline.md) alege un interval continuu de rânduri sortate după timp; [filtrele](filters.md), vizibilitatea grupurilor, împărțirea pentru diferență, [eliminarea după distanță](depth-and-culling.md#distance-culling) și [secțiunea](slice.md) decid, pentru fiecare rând, în shader-ul de vârfuri, dacă și cât contribuie.
2. **Împrăștiere.** Fiecare rând care contribuie este desenat ca un sprite (sau, în modul Linii, ca un segment) într-o **țintă de căldură** cu virgulă mobilă, adunându-i valoarea din rampă. Când sunt mai multe rânduri decât poate permite un cadru, se desenează un eșantion stratificat al rândurilor, ponderat ca să compenseze. Vezi [Eșantionare și bugete](sampling-and-budgets.md).
3. **Acumulare.** Cât timp nimic nu se schimbă, cadrele se combină până când fiecare rând a contribuit exact o dată. Vezi [Acumulare](accumulation.md).
4. **Compunere.** Valoarea acumulată din fiecare pixel se împarte la **punctul de saturație**, se modelează cu **răspunsul la densitate**, se ridică cu **căldura minimă** și se caută în **rampa de culori**, a cărei transparență o amestecă peste scenă. Vezi [Culoare și expunere](colour-and-exposure.md).

Tot ce ține de pasul 4 se aplică la compunere, deci tragerea acestor comenzi nu repornește niciodată acumularea; orice ține de pașii 1-2 o repornește.

## Pagini din această secțiune {#pages-in-this-section}

- [Căldură](heat.md) - modul simplu de căldură și prezentarea panourilor lui
  - [Forma sprite-ului](sprite-shape.md) - raza, intensitățile, atenuarea, editorul de curbe, limitele de pixeli, aplatizarea
  - [Culoare și expunere](colour-and-exposure.md) - editorul de rampă, punctul de saturație, expunerea automată, căldura minimă, răspunsul la densitate
  - [Adâncime și eliminarea fețelor](depth-and-culling.md) - ascunderea de către nivel, ascunderea în spatele terenului, eliminarea după distanță
- [Diferență](difference.md) - împărțirea pentru diferență
- [Căldură pe echipe](team-heat.md)
- [Căldură pe linii](line-heat.md) - trasee
- [Suprapunerea figurilor](box-replay.md) - modul de reluare (fișierul se numește încă reluarea în cutie)
- [Căldură direcțională](directional-heat.md)
- [Ponderarea valorilor](value-weighting.md)
