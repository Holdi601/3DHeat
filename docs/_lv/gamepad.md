---
title: "Spēļu pults un HOTAS"
parent: "Kamera un vadība"
nav_order: 1
lang: "lv"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Spēļu pults un HOTAS

Kameru var vadīt ar Xbox stila pulti, nevis ar tastatūru. Izmantojiet to, ja vēlaties atsēsties un apskatīt lielu ainu. Tās ievade **papildina** tastatūras ievadi, tāpēc varat izmantot abas vienlaikus.

## Pievienojiet pulti {#connect-a-controller}

1. Ievienojiet pulti (vai savienojiet to pārī).
2. Noklikšķiniet uz skata un nospiediet jebkuru pults pogu. Pārlūki parāda pulti tikai pēc tās pirmās ievades.
3. Atveriet **Kamera un aina → Spēļu pults**. Ierīču sarakstā tā ir redzama ar `●`.
4. Pabīdiet kreiso sviru, lai lidotu, un labo, lai skatītos. Ja kamera dreifē, kad sviras ir centrā, palieliniet **Mirušo zonu**.

Jebkura ierīce, ko pārlūks attēlo standarta pults izkārtojumā, darbojas. Lidojuma svira vai droseļvārsts (HOTAS) pēc noklusējuma tiek ignorēts; skatiet tālāk.

## Vadība {#mapping}

| Vadība | Iedarbība |
|---|---|
| Kreisā svira | Kustība: uz priekšu un atpakaļ un sānu soļi |
| Labā svira | Skatīšanās: pagriešana un noliekšana ar *Skatīšanās ātrumu* grādos sekundē pilnā nobīdē |
| `RT` / `LT` (analogie) | Augšup / lejup; paralēlajā projekcijā: tuvināt / tālināt |
| `RB` (turot) | 6× ātrāk |
| `LB` (turot) | 15% ātruma |
| `A` (turot) | 3× spurts (kombinējas ar RB/LB) |
| `Y` (nospiežot) | Ietvert datus |

Pogu numuri seko standarta izkārtojumam: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; sviras ir uz asīm 0–1 (kreisā) un 2–3 (labā).

## Spēļu pults iestatījumi {#the-gamepad-settings}

Sadaļā **Kamera un aina → Spēļu pults**. **Iestatījumi** / **Slēpt** atver regulēšanas vadības.

| Vadība | Noklusējums | Diapazons (ritināšanai) | Nozīme |
|---|---|---|---|
| **Ieslēgts** | ieslēgts | | |
| Ierīces statuss | | | Katra pievienotā ierīce: `●`, ja tai seko, `○`, ja neseko, ar *- nav XInput pults, ignorēta* vai *- nav XInput pults, tomēr izmantota* nestandarta ierīcēm. Ja nav nevienas: *Pults nav atrasta. Pārlūki atklāj kontrolieri tikai pēc tā pirmās ievades. Nospiediet uz tā kādu pogu.* |
| **Izmantot ierīci** | *Tikai XInput pultis (ieteicams)* | | Rāda, kad ir pievienota nestandarta ierīce. Izvēlieties ierīci pēc nosaukuma, lai sekotu tai. |
| **Skatīšanās ātrums** | 150°/s | 20–540 (5000) | Pagriešanās ātrums pilnā labās sviras nobīdē. |
| **Mirušā zona** | 12% | 0–50% (95%) | Radiāla: diagonāls grūdiens nekad nenonāk tikai vienā asī. Palieliniet, ja kamera dreifē, kad sviras ir centrā. |
| **Sviras līkne** | x² | lineāra (1) līdz x⁴ (16) | Atbildes eksponents aiz mirušās zonas: precīzāka vadība centra tuvumā, joprojām pilns ātrums malā. |
| **Apgriezt sviras Y** | izslēgts | | |
| **Apmainīt sviras** | izslēgts | | Kustība ar labo sviru, skatīšanās ar kreiso. |

Sviras formēšana: ar nobīdi *m* (sviras vektora garums) un mirušo zonu *d* izvade ir ((m - d) / (1 - d)) ^ līkne pa sviras virzienu, un 0 mirušās zonas iekšpusē.

## Kāpēc pēc noklusējuma tikai standarta pultis {#why-only-standard-pads-by-default}

Gamepad API ziņo **katru** HID ierīci ar asīm: lidojuma sviras, droseļvārstus, pedāļus, stūres. Tās neatrodas centrā. Pagriešanas ass vai droseļvārsta svira atrodas pilnā nobīdē, kad to neviens nepieskaras. Ja to nolasa kā sviru, tas ir pastāvīgs pilnā ātruma ievads, ko neviena mirušā zona nevar apspiest. Kamera griežas pati no brīža, kad lapa ielādējas, un katrs siltuma režīms izskatās bojāts, jo kustīga kamera katrā kadrā restartē uzkrāšanu.

Tāpēc ierīcei seko tikai tad, kad pārlūks ziņo `mapping: "standard"`, tas ir, "XInput stila pults ar asīm tur, kur tās sagaidāt". Citas ierīces tiek parādītas un atzīmētas kā ignorētas. **Izmantot ierīci** izvēlas vienu skaidri, piemēram, lai lidotu kameru ar HOTAS. Kad pults tiek sekota, kamera paliek pie tās, tāpēc divas pultis nestrīdas par kameru atkarībā no uzskaites secības.

**HOTAS:** tiek nolasītas tikai asis 0–3 (divas sviras) un standarta pogas. Droseļvārsts vai pedāļi uz citām asīm nedara neko, un svira vai droseļvārsts, kura asis neatrodas centrā, var prasīt lielāku **Mirušo zonu**.

Pārlūki paslēpj kontrolieri, kamēr tas nav nosūtījis pirmo ievadi. Tāpēc pievienota pults, kas nav pieskarta, lapai vēl nepastāv.
